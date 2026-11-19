CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
 id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','active','unsubscribed')), consent TEXT NOT NULL, consent_at INTEGER NOT NULL, source TEXT NOT NULL, token_hash TEXT UNIQUE, expires INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, confirmed_at INTEGER, unsubscribed_at INTEGER, unsubscribe_hash TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS issues(id INTEGER PRIMARY KEY,subject TEXT NOT NULL,body TEXT NOT NULL,status TEXT DEFAULT 'draft');
CREATE TABLE IF NOT EXISTS deliveries(issue INTEGER,subscriber TEXT,status TEXT DEFAULT 'queued',PRIMARY KEY(issue,subscriber));
CREATE TABLE IF NOT EXISTS inbox(id INTEGER PRIMARY KEY,email TEXT,subject TEXT,body TEXT,html TEXT);
CREATE TABLE IF NOT EXISTS limits(bucket TEXT PRIMARY KEY,n INTEGER,expires INTEGER);
CREATE TABLE IF NOT EXISTS guests(id TEXT PRIMARY KEY, email TEXT UNIQUE, salt TEXT, password TEXT,plan TEXT);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,guest TEXT,expires INTEGER);
CREATE TABLE IF NOT EXISTS requests(id INTEGER PRIMARY KEY,guest TEXT,service TEXT,package TEXT,created_at INTEGER);
