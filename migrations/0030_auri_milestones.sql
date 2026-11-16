CREATE TABLE IF NOT EXISTS auri_verified_milestones (
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  outcome TEXT NOT NULL,
  evidence_ref TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  verified_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (organization_id, outcome),
  UNIQUE (organization_id, evidence_ref)
);
