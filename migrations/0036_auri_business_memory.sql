CREATE TABLE auri_conversations (
 id TEXT PRIMARY KEY,
 customer_id TEXT NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
 organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
 title TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 0,
 write_token TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now'))
);
CREATE INDEX auri_conversations_scope ON auri_conversations(customer_id,organization_id,updated_at DESC);
CREATE INDEX auri_conversations_retention ON auri_conversations(updated_at);

CREATE TABLE auri_messages (
 conversation_id TEXT NOT NULL REFERENCES auri_conversations(id) ON DELETE CASCADE,
 turn INTEGER NOT NULL CHECK (turn > 0),
 role TEXT NOT NULL CHECK (role IN ('user','assistant')),
 body TEXT NOT NULL,
 package_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(package_ids)),
 PRIMARY KEY (conversation_id,turn,role)
);

CREATE TABLE auri_memory_summaries (
 conversation_id TEXT PRIMARY KEY REFERENCES auri_conversations(id) ON DELETE CASCADE,
 topics TEXT NOT NULL CHECK (json_valid(topics)),
 turns INTEGER NOT NULL CHECK (turns > 0)
);

CREATE TABLE auri_memories (
 id TEXT PRIMARY KEY,
 customer_id TEXT NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
 organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
 source_conversation_id TEXT REFERENCES auri_conversations(id) ON DELETE CASCADE,
 scope TEXT NOT NULL CHECK (scope IN ('private','shared')),
 kind TEXT NOT NULL CHECK (kind IN ('goal','preference','business_fact')),
 value TEXT NOT NULL,
 status TEXT NOT NULL CHECK (status IN ('suggested','approved')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
 CHECK (scope='private' OR (organization_id IS NOT NULL AND status='approved')),
 CHECK (status='approved' OR source_conversation_id IS NOT NULL)
);
CREATE INDEX auri_memory_scope ON auri_memories(organization_id,status,scope,customer_id,updated_at DESC);
CREATE INDEX auri_memory_source ON auri_memories(source_conversation_id);
CREATE INDEX auri_memory_retention ON auri_memories(status,updated_at);

CREATE TRIGGER auri_link_onboarding_suggestions
AFTER UPDATE OF organization_id ON auri_conversations
WHEN OLD.organization_id IS NULL AND NEW.organization_id IS NOT NULL
BEGIN
 UPDATE auri_memories SET organization_id=NEW.organization_id,
  source_conversation_id=CASE WHEN status='approved' THEN NULL ELSE source_conversation_id END
 WHERE source_conversation_id=NEW.id AND customer_id=NEW.customer_id AND organization_id IS NULL;
END;
