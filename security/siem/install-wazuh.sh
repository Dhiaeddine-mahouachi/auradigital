#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "Run this script as root (sudo bash install-wazuh.sh)." >&2
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WAZUH_INSTALL_URL="https://packages.wazuh.com/4.14/wazuh-install.sh"
WAZUH_INSTALLER="/root/wazuh-install.sh"
AURA_ETC_DIR="/etc/auradigital-siem"
AURA_STATE_DIR="/var/lib/auradigital-siem"
AURA_LOG_DIR="/var/log/auradigital"
AURA_LOG_FILE="${AURA_LOG_DIR}/audit.jsonl"
OSSEC_CONF="/var/ossec/etc/ossec.conf"
RULES_FILE="/var/ossec/etc/rules/local_rules.xml"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl ca-certificates jq ufw python3

install -d -m 700 "${AURA_ETC_DIR}"
install -d -m 700 "${AURA_STATE_DIR}"
install -d -m 750 "${AURA_LOG_DIR}"
touch "${AURA_LOG_FILE}"
chmod 640 "${AURA_LOG_FILE}"

if ! systemctl list-unit-files 2>/dev/null | grep -q '^wazuh-manager\.service'; then
  curl -fsSL "${WAZUH_INSTALL_URL}" -o "${WAZUH_INSTALLER}"
  chmod 700 "${WAZUH_INSTALLER}"
  bash "${WAZUH_INSTALLER}" -a
else
  echo "Wazuh appears to be installed; skipping central-component installation."
fi

# Install AuraDigital custom rules.
if [[ -f "${SCRIPT_DIR}/wazuh/local_rules.xml" ]]; then
  if [[ -f "${RULES_FILE}" ]]; then
    cp -a "${RULES_FILE}" "${RULES_FILE}.bak.$(date +%Y%m%d%H%M%S)"
  fi
  install -m 640 "${SCRIPT_DIR}/wazuh/local_rules.xml" "${RULES_FILE}"
fi

# Add a localfile monitor exactly once.
if ! grep -qF '<location>/var/log/auradigital/audit.jsonl</location>' "${OSSEC_CONF}"; then
  python3 - <<'PY'
from pathlib import Path
p = Path('/var/ossec/etc/ossec.conf')
text = p.read_text()
block = '''\n  <localfile>\n    <log_format>json</log_format>\n    <location>/var/log/auradigital/audit.jsonl</location>\n  </localfile>\n'''
marker = '</ossec_config>'
if marker not in text:
    raise SystemExit('Could not find </ossec_config> in /var/ossec/etc/ossec.conf')
p.write_text(text.replace(marker, block + marker, 1))
PY
fi

# Stage the collector and timer. The timer is only enabled after real credentials are supplied.
install -m 700 "${SCRIPT_DIR}/collect-audit.py" /usr/local/sbin/aura-audit-collector
install -m 644 "${SCRIPT_DIR}/systemd/aura-audit-collector.service" /etc/systemd/system/aura-audit-collector.service
install -m 644 "${SCRIPT_DIR}/systemd/aura-audit-collector.timer" /etc/systemd/system/aura-audit-collector.timer

if [[ ! -f "${AURA_ETC_DIR}/collector.env" ]]; then
  cat > "${AURA_ETC_DIR}/collector.env.example" <<'EOF'
AURA_BASE_URL=https://auradigital.ink
AURA_ADMIN_USERNAME=owner
AURA_ADMIN_PASSWORD=CHANGE_ME
EOF
  chmod 600 "${AURA_ETC_DIR}/collector.env.example"
fi

systemctl daemon-reload

# Wazuh recommends disabling its package repository after installation to avoid accidental upgrades.
if [[ -f /etc/apt/sources.list.d/wazuh.list ]]; then
  sed -i 's/^deb /#deb /' /etc/apt/sources.list.d/wazuh.list
  apt-get update
fi

systemctl restart wazuh-manager
systemctl enable wazuh-manager wazuh-indexer wazuh-dashboard >/dev/null 2>&1 || true

if [[ -f "${AURA_ETC_DIR}/collector.env" ]] && ! grep -q 'CHANGE_ME' "${AURA_ETC_DIR}/collector.env"; then
  chmod 600 "${AURA_ETC_DIR}/collector.env"
  systemctl enable --now aura-audit-collector.timer
else
  echo "Collector timer staged but not enabled: configure ${AURA_ETC_DIR}/collector.env first."
fi

cat <<'EOF'

Aura Secure SIEM base installation is complete.

Next:
1. Store the generated Wazuh admin password in a password manager.
2. Configure /etc/auradigital-siem/collector.env with the AuraDigital owner credentials and mode 0600.
3. Run: systemctl enable --now aura-audit-collector.timer
4. Restrict dashboard/agent ports with a firewall, VPN, or Cloudflare Access before production use.
5. Point soc.auradigital.ink to this server only after access controls and trusted TLS are ready.

EOF
