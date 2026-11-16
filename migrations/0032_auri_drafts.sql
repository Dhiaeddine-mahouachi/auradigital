CREATE TABLE IF NOT EXISTS auri_drafts (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 customer_id TEXT NOT NULL REFERENCES customer_users(id),
 body TEXT NOT NULL,
 source TEXT NOT NULL CHECK(source IN ('ai','template')),
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auri_drafts_by_member ON auri_drafts(organization_id,customer_id,created_at DESC,id DESC);
