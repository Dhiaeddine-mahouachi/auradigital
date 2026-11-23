-- Account profile photos (additive). Also created on first use by the Worker.
CREATE TABLE IF NOT EXISTS customer_profile_photos (
 customer_id TEXT PRIMARY KEY REFERENCES customer_users(id) ON DELETE CASCADE,
 data_url TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
