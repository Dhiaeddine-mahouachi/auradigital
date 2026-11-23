-- Saved Auri conversations (additive). Also created on first use by the Worker.
CREATE TABLE IF NOT EXISTS hub_auri_messages (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('me','auri')),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS hub_auri_messages_owner ON hub_auri_messages(organization_id, customer_id, created_at);
