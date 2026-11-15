CREATE TABLE IF NOT EXISTS hub_contact_requests (
  request_id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  customer_id TEXT NOT NULL REFERENCES customer_users(id),
  service TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hub_contact_requests_workspace
  ON hub_contact_requests(organization_id, customer_id, submitted_at DESC, request_id);
