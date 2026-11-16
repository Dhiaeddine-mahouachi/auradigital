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
