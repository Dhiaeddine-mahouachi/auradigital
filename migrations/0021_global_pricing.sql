-- Additive only. Existing invoices, subscriptions and agreed prices are untouched.
-- Runtime performs idempotent owner-approved initial catalogue seeding.
CREATE TABLE IF NOT EXISTS global_pricing_versions (
 id TEXT PRIMARY KEY, config TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 actor TEXT NOT NULL, action TEXT NOT NULL, previous_id TEXT, changes TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS global_pricing_state (
 id INTEGER PRIMARY KEY CHECK(id=1), revision TEXT NOT NULL,
 published TEXT NOT NULL, draft TEXT NOT NULL
);
