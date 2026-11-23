-- Aura Studio lead pipeline (additive). The Worker also creates these tables
-- on first use with CREATE TABLE IF NOT EXISTS, so this file is idempotent.
-- No existing table or row is modified.
CREATE TABLE IF NOT EXISTS hub_lead_stages (
  organization_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  stages_json TEXT NOT NULL CHECK(json_valid(stages_json)),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS hub_leads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'other',
  interest TEXT NOT NULL DEFAULT '',
  value_minor INTEGER,
  stage TEXT NOT NULL,
  assignee_id TEXT,
  follow_up_at TEXT,
  last_contacted_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS hub_leads_org ON hub_leads(organization_id, archived_at, updated_at);
CREATE TABLE IF NOT EXISTS hub_lead_notes (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES hub_leads(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS hub_lead_notes_lead ON hub_lead_notes(lead_id, created_at);
