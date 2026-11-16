CREATE TABLE IF NOT EXISTS auri_preferences (
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 customer_id TEXT NOT NULL REFERENCES customer_users(id),
 display_name TEXT NOT NULL DEFAULT 'Auri',
 hidden INTEGER NOT NULL DEFAULT 0 CHECK(hidden IN (0,1)),
 PRIMARY KEY (organization_id,customer_id)
);
