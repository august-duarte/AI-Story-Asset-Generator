-- stories: private generated stories owned by a user
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  tone TEXT,
  style TEXT NOT NULL,
  title TEXT NOT NULL,
  body_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stories_user_id_idx ON stories (user_id);
