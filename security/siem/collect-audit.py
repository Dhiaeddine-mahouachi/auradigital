#!/usr/bin/env python3
import http.cookiejar
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("AURA_BASE_URL", "https://auradigital.ink").rstrip("/")
USERNAME = os.environ.get("AURA_ADMIN_USERNAME", "")
PASSWORD = os.environ.get("AURA_ADMIN_PASSWORD", "")
LOG_PATH = pathlib.Path(os.environ.get("AURA_SIEM_LOG", "/var/log/auradigital/audit.jsonl"))
STATE_PATH = pathlib.Path(os.environ.get("AURA_SIEM_STATE", "/var/lib/auradigital-siem/seen.json"))

if not USERNAME or not PASSWORD:
    print("AURA_ADMIN_USERNAME and AURA_ADMIN_PASSWORD are required", file=sys.stderr)
    raise SystemExit(2)

origin = BASE_URL
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def request_json(path, method="GET", payload=None):
    data = None
    headers = {
        "Accept": "application/json",
        "User-Agent": "AuraSecureSIEM/1.0",
        "Origin": origin,
        "Referer": origin + "/admin/",
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE_URL + path, data=data, method=method, headers=headers)
    with opener.open(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_seen():
    try:
        raw = json.loads(STATE_PATH.read_text())
        if isinstance(raw, list):
            return set(str(x) for x in raw[-1000:])
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        pass
    return set()


def save_seen(seen):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(list(seen)[-1000:]))
    os.chmod(tmp, 0o600)
    tmp.replace(STATE_PATH)


try:
    request_json(
        "/api/admin/login",
        method="POST",
        payload={"username": USERNAME, "password": PASSWORD},
    )
    response = request_json("/api/admin/audit-logs")
except urllib.error.HTTPError as exc:
    print(f"AuraDigital collector HTTP error: {exc.code}", file=sys.stderr)
    raise SystemExit(1)
except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
    print(f"AuraDigital collector error: {exc}", file=sys.stderr)
    raise SystemExit(1)

items = response.get("items", []) if isinstance(response, dict) else []
if not isinstance(items, list):
    raise SystemExit("Unexpected audit API response")

seen = load_seen()
new_items = []
for item in items:
    if not isinstance(item, dict):
        continue
    event_id = str(item.get("id", "")).strip()
    if not event_id or event_id in seen:
        continue
    new_items.append(item)

new_items.sort(key=lambda x: str(x.get("createdAt", "")))
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
with LOG_PATH.open("a", encoding="utf-8") as handle:
    for item in new_items:
        normalized = {
            "integration": "auradigital",
            "event": "admin_audit",
            "id": str(item.get("id", "")),
            "username": str(item.get("username", "")),
            "action": str(item.get("action", "")),
            "resource": str(item.get("resource", "")),
            "targetId": str(item.get("targetId", "")),
            "requestId": str(item.get("requestId", "")),
            "createdAt": str(item.get("createdAt", "")),
        }
        handle.write(json.dumps(normalized, separators=(",", ":")) + "\n")
        seen.add(normalized["id"])

os.chmod(LOG_PATH, 0o640)
save_seen(seen)
print(f"wrote {len(new_items)} new AuraDigital audit events")
