// Generated from migrations/0005_ai_employee.sql; kept identical by regression tests.
export const schema = [
  "CREATE TABLE IF NOT EXISTS ai_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS ai_knowledge (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, content TEXT NOT NULL, source_url TEXT NOT NULL, source_type TEXT NOT NULL, verified_at TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','draft','outdated','archived')), language TEXT NOT NULL, visibility TEXT NOT NULL CHECK(visibility IN ('public','internal')), priority INTEGER NOT NULL DEFAULT 50, draft TEXT, approved_by TEXT)",
  "CREATE VIRTUAL TABLE IF NOT EXISTS ai_fts USING fts5(id UNINDEXED,title,content,category, tokenize='unicode61')",
  "CREATE TABLE IF NOT EXISTS ai_sessions (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, state TEXT NOT NULL DEFAULT '{}', language TEXT NOT NULL DEFAULT 'en', persistent INTEGER NOT NULL DEFAULT 0, expires_at TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), busy_until INTEGER NOT NULL DEFAULT 0)",
  "CREATE TABLE IF NOT EXISTS ai_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS ai_message_session ON ai_messages(session_id,id)",
  "CREATE TABLE IF NOT EXISTS ai_requests (id TEXT PRIMARY KEY, session_id TEXT, kind TEXT NOT NULL, client_id INTEGER, details TEXT NOT NULL, consent INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(session_id,kind))",
  "CREATE TABLE IF NOT EXISTS ai_usage (day TEXT PRIMARY KEY, reserved_tokens INTEGER NOT NULL DEFAULT 0, input_tokens INTEGER NOT NULL DEFAULT 0, output_tokens INTEGER NOT NULL DEFAULT 0, calls INTEGER NOT NULL DEFAULT 0, failures INTEGER NOT NULL DEFAULT 0)",
  "CREATE TABLE IF NOT EXISTS ai_events (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, event TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', latency_ms INTEGER NOT NULL DEFAULT 0, details TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS ai_event_date ON ai_events(created_at)",
  "CREATE INDEX IF NOT EXISTS ai_session_expiry ON ai_sessions(expires_at)",
  "CREATE INDEX IF NOT EXISTS ai_request_date ON ai_requests(created_at)"
];
