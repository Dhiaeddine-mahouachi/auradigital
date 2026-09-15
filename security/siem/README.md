# Aura Secure SIEM

This directory contains the reproducible SOC/SIEM deployment package for AuraDigital.

## Architecture

```text
AuraDigital Cloudflare Worker / D1 audit log
                |
                | HTTPS collector (owner-authenticated, root-only credentials)
                v
      /var/log/auradigital/audit.jsonl
                |
                v
           Wazuh Manager
                |
        +-------+--------+
        |                |
        v                v
 Wazuh Indexer      Wazuh Dashboard
                         |
                         v
                 private SOC access
```

Additional Windows/Linux endpoints can run the Wazuh agent and report to the same manager.

## Recommended host

For a small lab / 1-25 endpoints, use the Wazuh quickstart recommendation: 4 vCPU, 8 GiB RAM, at least 50 GB storage. Ubuntu 24.04 is supported.

## Install

Clone this repository on the SIEM host and run as root:

```bash
cd security/siem
sudo bash install-wazuh.sh
```

The Wazuh installer prints the generated `admin` password. Store it in a password manager and do not commit it.

## AuraDigital audit collector

The existing application exposes owner-only audit data from `/api/admin/audit-logs`. The collector authenticates with an owner account, fetches the latest audit events, deduplicates them locally, and writes normalized JSON lines for Wazuh.

Create `/etc/auradigital-siem/collector.env` with mode `0600`:

```bash
AURA_BASE_URL=https://auradigital.ink
AURA_ADMIN_USERNAME=owner
AURA_ADMIN_PASSWORD=CHANGE_ME
```

Never commit this file.

Install the collector:

```bash
sudo install -d -m 700 /etc/auradigital-siem
sudo install -d -m 750 /var/log/auradigital
sudo install -m 700 collect-audit.py /usr/local/sbin/aura-audit-collector
sudo install -m 644 systemd/aura-audit-collector.service /etc/systemd/system/
sudo install -m 644 systemd/aura-audit-collector.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now aura-audit-collector.timer
```

## Wazuh rules

`install-wazuh.sh` installs `wazuh/local_rules.xml` into the Wazuh rules directory and configures Wazuh to monitor `/var/log/auradigital/audit.jsonl` as JSON.

The rules alert on AuraDigital administrative actions, including account/role/password changes, destructive actions, and other privileged activity.

## Network policy

Do not expose the dashboard without authentication. Prefer restricting dashboard access to your own IP/VPN/Cloudflare Access. Agent enrollment and event ports should only be open to networks that need them.

Typical ports:

- `443/tcp` - Wazuh dashboard
- `1514/tcp` - Wazuh agent events
- `1515/tcp` - Wazuh agent enrollment
- `55000/tcp` - Wazuh API; keep private unless explicitly required

## What GitHub is for

GitHub stores the SIEM configuration, rules, collector, tests, documentation, and change history. The live SOC data and credentials must stay on the SIEM server and must never be committed.

## Next endpoints

1. AuraDigital administrative audit log (collector in this directory)
2. Your Windows workstation with Wazuh Agent + Sysmon
3. Any future AuraDigital Linux server
4. Client servers only after explicit customer authorization

## Security notes

- Use unique credentials and MFA wherever available.
- Rotate the AuraDigital owner password if it is ever exposed.
- Keep `/etc/auradigital-siem/collector.env` root-readable only.
- Use a VPN or Cloudflare Access in front of the dashboard for production use.
- Do not advertise 24/7 incident response unless AuraDigital actually staffs it.
