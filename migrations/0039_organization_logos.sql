-- Business logos (additive). Also created on first use by the Worker.
CREATE TABLE IF NOT EXISTS organization_logos (
 organization_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
 data_url TEXT NOT NULL,
 updated_by TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
