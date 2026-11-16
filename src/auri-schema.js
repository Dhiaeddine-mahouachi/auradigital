// Keep this additive bootstrap in sync with migrations 0030 through 0034.
// The production Worker can safely initialize the new tables through its D1 binding.
export const auriSchema = `
CREATE TABLE IF NOT EXISTS auri_verified_milestones (
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  outcome TEXT NOT NULL,
  evidence_ref TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  verified_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (organization_id, outcome),
  UNIQUE (organization_id, evidence_ref)
);
CREATE TABLE IF NOT EXISTS auri_preferences (
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 customer_id TEXT NOT NULL REFERENCES customer_users(id),
 display_name TEXT NOT NULL DEFAULT 'Auri',
 hidden INTEGER NOT NULL DEFAULT 0 CHECK(hidden IN (0,1)),
 PRIMARY KEY (organization_id,customer_id)
);
CREATE TABLE IF NOT EXISTS auri_drafts (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 customer_id TEXT NOT NULL REFERENCES customer_users(id),
 body TEXT NOT NULL,
 source TEXT NOT NULL CHECK(source IN ('ai','template')),
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auri_drafts_by_member ON auri_drafts(organization_id,customer_id,created_at DESC,id DESC);
CREATE TABLE IF NOT EXISTS mission_evidence (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 mission_id TEXT NOT NULL REFERENCES business_missions(id),
 submitted_by TEXT NOT NULL REFERENCES customer_users(id),
 outcome TEXT NOT NULL,
 mission_title TEXT NOT NULL,
 proof TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 reviewed_by TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 reviewed_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS mission_one_pending_evidence ON mission_evidence(mission_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS mission_evidence_workspace ON mission_evidence(organization_id,created_at);
CREATE INDEX IF NOT EXISTS mission_evidence_queue ON mission_evidence(status,created_at);
CREATE TABLE IF NOT EXISTS auri_appearance (
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 customer_id TEXT NOT NULL REFERENCES customer_users(id),
 skin TEXT NOT NULL DEFAULT 'original' CHECK(skin IN ('original','mint','violet')),
 still INTEGER NOT NULL DEFAULT 0 CHECK(still IN (0,1)),
 PRIMARY KEY (organization_id,customer_id)
);
`.trim();

const ready=new WeakSet();

export async function ensureAuriSchema(db) {
 if(ready.has(db))return;
 const statements=auriSchema.split(';').map(sql=>sql.trim()).filter(Boolean);
 await db.batch(statements.map(sql=>db.prepare(sql)));
 ready.add(db);
}
