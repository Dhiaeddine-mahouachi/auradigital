CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY NOT NULL,
  service TEXT NOT NULL DEFAULT 'auradigital',
  category TEXT NOT NULL DEFAULT 'security',
  event TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'other',
  method TEXT NOT NULL DEFAULT '',
  status INTEGER NOT NULL DEFAULT 0,
  request_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_security_events_created
  ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event
  ON security_events(event, created_at DESC);

CREATE TABLE IF NOT EXISTS soc_alert_state (
  event_id TEXT PRIMARY KEY NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('security','audit')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  note TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
