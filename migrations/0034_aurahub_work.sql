CREATE TABLE IF NOT EXISTS hub_contact_requests (
 request_id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id)
);
CREATE INDEX IF NOT EXISTS hub_contact_requests_org ON hub_contact_requests(organization_id);
CREATE TABLE IF NOT EXISTS hub_menu_reviews (
 draft_id TEXT PRIMARY KEY REFERENCES menu_drafts(id),
 version INTEGER NOT NULL
);
