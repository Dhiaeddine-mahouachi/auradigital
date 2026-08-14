CREATE TABLE IF NOT EXISTS employee_users (
  id TEXT PRIMARY KEY NOT NULL,
  portal_slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS employee_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  employee_user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_user_id) REFERENCES employee_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_sessions_user ON employee_sessions(employee_user_id);
CREATE INDEX IF NOT EXISTS idx_employee_sessions_expires ON employee_sessions(expires_at);

CREATE TABLE IF NOT EXISTS employee_clients (
  id TEXT PRIMARY KEY NOT NULL,
  employee_user_id TEXT NOT NULL,
  main_client_id INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','contacted','active','waiting','completed')),
  last_contact TEXT,
  next_follow_up TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_user_id) REFERENCES employee_users(id) ON DELETE CASCADE,
  FOREIGN KEY (main_client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_clients_owner_updated ON employee_clients(employee_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_clients_owner_followup ON employee_clients(employee_user_id, next_follow_up);

CREATE TABLE IF NOT EXISTS employee_audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  employee_user_id TEXT,
  actor_snapshot TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL DEFAULT '',
  request_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_user_id) REFERENCES employee_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_employee_audit_created ON employee_audit_log(created_at DESC);
