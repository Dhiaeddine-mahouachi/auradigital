-- Security tokens are bearer secrets; store only SHA-256 hashes.
CREATE TABLE IF NOT EXISTS auramenu_edit_access (
  menu_id TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL DEFAULT '',
  request_status TEXT NOT NULL DEFAULT 'none',
  requested_at TEXT,
  requested_days INTEGER NOT NULL DEFAULT 0,
  requested_amount INTEGER NOT NULL DEFAULT 0,
  access_until TEXT,
  paid_amount INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (menu_id) REFERENCES auramenu_requests(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS nfc_status_tokens (
  request_id TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES nfc_requests(id) ON DELETE CASCADE
);
