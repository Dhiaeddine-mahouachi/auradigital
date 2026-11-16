CREATE TABLE IF NOT EXISTS auri_appearance (
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 customer_id TEXT NOT NULL REFERENCES customer_users(id),
 skin TEXT NOT NULL DEFAULT 'original' CHECK(skin IN ('original','mint','violet')),
 still INTEGER NOT NULL DEFAULT 0 CHECK(still IN (0,1)),
 PRIMARY KEY (organization_id,customer_id)
);
