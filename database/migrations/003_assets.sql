-- assets: images generated from highlighted story passages
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  excerpt_text TEXT NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  prompt_used TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_offset >= 0),
  CHECK (end_offset > start_offset)
);

CREATE INDEX IF NOT EXISTS assets_story_id_idx ON assets (story_id);
