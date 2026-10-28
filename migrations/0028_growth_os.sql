-- Additive only. Apply to a restored staging database first; never auto-apply in a request.
CREATE TABLE customer_verified_emails (
 customer_id TEXT PRIMARY KEY REFERENCES customer_users(id), email TEXT NOT NULL COLLATE NOCASE,
 verified_at TEXT NOT NULL DEFAULT (datetime('now')), source TEXT NOT NULL CHECK(source IN ('email','google'))
);
CREATE TABLE customer_action_tokens (
 token_hash TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customer_users(id),
 email TEXT NOT NULL COLLATE NOCASE, purpose TEXT NOT NULL CHECK(purpose IN ('verify','reset')),
 expires_at INTEGER NOT NULL, consumed_by TEXT, created_at INTEGER NOT NULL
);
CREATE INDEX customer_action_expiry ON customer_action_tokens(expires_at);
CREATE TABLE customer_external_identities (
 provider TEXT NOT NULL CHECK(provider='google'), subject TEXT NOT NULL,
 customer_id TEXT NOT NULL REFERENCES customer_users(id), PRIMARY KEY(provider,subject), UNIQUE(provider,customer_id)
);
CREATE TABLE customer_oidc_flows (
 state_hash TEXT PRIMARY KEY, binding_hash TEXT NOT NULL, verifier TEXT NOT NULL, nonce TEXT NOT NULL,
 customer_id TEXT REFERENCES customer_users(id), expires_at INTEGER NOT NULL, return_path TEXT NOT NULL DEFAULT '/hub'
);
CREATE INDEX customer_oidc_expiry ON customer_oidc_flows(expires_at);
CREATE TABLE organizations (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES customer_users(id), name TEXT NOT NULL,
 profile_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(profile_json)), mode TEXT NOT NULL DEFAULT 'myself' CHECK(mode IN ('myself','auri')),
 version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX organizations_owner ON organizations(owner_id);
CREATE TABLE organization_roles (id TEXT PRIMARY KEY CHECK(id IN ('owner','admin','member','viewer')), label TEXT NOT NULL);
INSERT INTO organization_roles VALUES ('owner','Owner'),('admin','Admin'),('member','Member'),('viewer','Viewer');
CREATE TABLE organization_permissions (
 role_id TEXT NOT NULL REFERENCES organization_roles(id), permission TEXT NOT NULL,
 PRIMARY KEY(role_id,permission)
);
INSERT INTO organization_permissions VALUES
 ('owner','profile:write'),('owner','roadmap:write'),('owner','simulation:write'),('owner','team:manage'),('owner','workspace:read'),('owner','auri:use'),
 ('admin','profile:write'),('admin','roadmap:write'),('admin','simulation:write'),('admin','workspace:read'),('admin','auri:use'),
 ('member','workspace:read'),('member','auri:use'),('viewer','workspace:read');
CREATE TABLE organization_members (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), customer_id TEXT NOT NULL REFERENCES customer_users(id),
 role_id TEXT NOT NULL REFERENCES organization_roles(id) CHECK(role_id<>'owner'),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','removed')),
 permissions_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(permissions_json)),
 created_at TEXT NOT NULL DEFAULT (datetime('now')), removed_at TEXT, UNIQUE(organization_id,customer_id)
);
CREATE INDEX members_customer ON organization_members(customer_id,status);
CREATE TABLE organization_invitations (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), invited_by TEXT NOT NULL REFERENCES customer_users(id),
 email TEXT NOT NULL COLLATE NOCASE, role_id TEXT NOT NULL REFERENCES organization_roles(id) CHECK(role_id<>'owner'),
 message TEXT NOT NULL DEFAULT '', token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','canceled','expired')),
 accepted_by TEXT REFERENCES customer_users(id), accepted_at TEXT, consent_version TEXT, acceptance_id TEXT,
 delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK(delivery_status IN ('pending','sent','failed')),
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX invitation_one_pending_email ON organization_invitations(organization_id,email) WHERE status='pending';
CREATE INDEX invitation_expiry ON organization_invitations(expires_at);
CREATE TABLE member_subscriptions (
 id TEXT PRIMARY KEY, membership_id TEXT NOT NULL UNIQUE REFERENCES organization_members(id),
 invitation_id TEXT NOT NULL UNIQUE REFERENCES organization_invitations(id), payer_customer_id TEXT NOT NULL REFERENCES customer_users(id),
 provider TEXT NOT NULL, provider_customer_id TEXT, provider_subscription_id TEXT UNIQUE,
 state TEXT NOT NULL DEFAULT 'pending_payment' CHECK(state IN ('pending_payment','active','past_due','canceled','expired')),
 price_minor INTEGER NOT NULL DEFAULT 500 CHECK(price_minor=500), currency TEXT NOT NULL DEFAULT 'USD' CHECK(currency='USD'),
 interval_unit TEXT NOT NULL DEFAULT 'month' CHECK(interval_unit='month'),
 entitlement_until INTEGER, next_payment_at INTEGER, canceled_at TEXT
);
CREATE TABLE subscription_payment_events (
 provider TEXT NOT NULL, event_id TEXT NOT NULL, subscription_id TEXT REFERENCES member_subscriptions(id),
 payload_hash TEXT NOT NULL, processed_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY(provider,event_id)
);
CREATE TABLE member_access_audit_logs (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), actor_id TEXT NOT NULL REFERENCES customer_users(id),
 action TEXT NOT NULL, target_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX member_audit_org ON member_access_audit_logs(organization_id,created_at);
CREATE TABLE business_missions (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), capability TEXT NOT NULL,
 data_json TEXT NOT NULL CHECK(json_valid(data_json)), status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','in_progress','done','postponed')),
 position INTEGER NOT NULL, version INTEGER NOT NULL DEFAULT 1, UNIQUE(organization_id,capability)
);
CREATE INDEX missions_org ON business_missions(organization_id,position);
CREATE TABLE growth_scenarios (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), created_by TEXT NOT NULL REFERENCES customer_users(id),
 name TEXT NOT NULL, inputs_json TEXT NOT NULL CHECK(json_valid(inputs_json)), results_json TEXT NOT NULL CHECK(json_valid(results_json)),
 formula_version TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX scenarios_org ON growth_scenarios(organization_id,created_at);
