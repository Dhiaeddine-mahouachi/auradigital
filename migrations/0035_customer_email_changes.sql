CREATE TABLE IF NOT EXISTS customer_email_changes (
 customer_id TEXT PRIMARY KEY NOT NULL REFERENCES customer_users(id),
 current_email TEXT NOT NULL,
 new_email TEXT NOT NULL,
 credential_fingerprint TEXT NOT NULL,
 current_token TEXT NOT NULL UNIQUE,
 new_token TEXT NOT NULL UNIQUE,
 current_confirmed INTEGER NOT NULL DEFAULT 0,
 new_confirmed INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL,
 completed_by TEXT
);
