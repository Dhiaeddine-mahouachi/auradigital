#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "Run this script as root (sudo bash install-wazuh.sh)." >&2
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WAZUH_INSTALL_URL="https://packages.wazuh.com/4.14/wazuh-install.sh"
WAZUH_INSTALLER="/root/wazuh-install.sh"
AURA_LOG_DIR="/var/log/auradigital"
AURA_LOG_FILE="${AURA_LOG_DIR}/audit.jsonl"
OSSEC_CONF="/var/ossec/etc/ossec.conf"
RULES_FILE="/var/ossec/etc/rules/local_rules.xml"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl ca-certificates jq ufw

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

# Wazuh recommends disabling its package repository after installation to avoid accidental upgrades.
if [[ -f /etc/apt/sources.list.d/wazuh.list ]]; then
  sed -i 's/^deb /#deb /' /etc/apt/sources.list.d/wazuh.list
  apt-get update
fi

systemctl restart wazuh-manager
systemctl enable wazuh-manager wazuh-indexer wazuh-dashboard >/dev/null 2>&1 || true

cat <<'EOF'

Aura Secure SIEM base installation is complete.

Next:
1. Read the Wazuh installer output and store the admin password in a password manager.
2. Create /etc/auradigital-siem/collector.env (mode 0600); never commit it.
3. Install/enable the audit collector systemd timer from this directory.
4. Restrict dashboard/agent ports with a firewall, VPN, or Cloudflare Access before production use.
5. Point soc.auradigital.ink to this server only after access controls and TLS are ready.

EOF
