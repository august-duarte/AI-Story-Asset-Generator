-- usage: daily story/image counters per user (unique on user + date)
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stories_used INTEGER NOT NULL DEFAULT 0 CHECK (stories_used >= 0),
  images_used INTEGER NOT NULL DEFAULT 0 CHECK (images_used >= 0),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS usage_counters_user_id_idx ON usage_counters (user_id);
