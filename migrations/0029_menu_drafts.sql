-- Private organizational drafts. Does not migrate, publish or change existing menu requests.
CREATE TABLE IF NOT EXISTS menu_drafts (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  created_by TEXT NOT NULL REFERENCES customer_users(id),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','preview','archived')),
  data_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_menu_drafts_org_updated ON menu_drafts(organization_id, updated_at DESC, id);
