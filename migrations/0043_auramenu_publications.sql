CREATE TABLE IF NOT EXISTS auramenu_publications (
  menu_id TEXT NOT NULL REFERENCES auramenu_requests(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  published_at TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('baseline','publish','update','restore')),
  actor_type TEXT NOT NULL CHECK(actor_type IN ('system','customer','admin','legacy-token')),
  actor_id TEXT,
  source_revision INTEGER,
  content_json TEXT NOT NULL CHECK(json_valid(content_json)),
  presentation_json TEXT NOT NULL CHECK(json_valid(presentation_json)),
  PRIMARY KEY (menu_id, revision)
);
