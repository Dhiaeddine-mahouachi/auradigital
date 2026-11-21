-- Explicit links between CRM clients and records from other services
-- (NFC, AuraMenu, websites, shop orders, AuraHub accounts) whose email or
-- phone does not match the client. Matching records need no link.
CREATE TABLE IF NOT EXISTS crm_links (
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  client_id INTEGER NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (source, source_id)
);
CREATE INDEX IF NOT EXISTS crm_links_client ON crm_links(client_id);
