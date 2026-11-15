CREATE TABLE IF NOT EXISTS hub_onboarding (
  customer_id TEXT PRIMARY KEY REFERENCES customer_users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('myself','auri')),
  step INTEGER NOT NULL CHECK (step BETWEEN 0 AND 20),
  profile_json TEXT NOT NULL CHECK (json_valid(profile_json)),
  workspace_id TEXT REFERENCES organizations(id) ON DELETE CASCADE
);
