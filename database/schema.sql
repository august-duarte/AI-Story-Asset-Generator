-- Full schema reference after applying database/migrations/001–004.
-- Human-readable picture of the DB — not applied by scripts/apply-migrations.mjs.
-- Source of applied changes: database/migrations/*.sql

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');

-- Accounts for admin-gated signup (pending until approved).
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Private generated stories owned by a user.
CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  tone TEXT,
  style TEXT NOT NULL,
  title TEXT NOT NULL,
  body_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX stories_user_id_idx ON stories (user_id);

-- Images generated from highlighted story passages.
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  excerpt_text TEXT NOT NULL,
  start_offset INTEGER NOT NULL CHECK (start_offset >= 0),
  end_offset INTEGER NOT NULL CHECK (end_offset > start_offset),
  prompt_used TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX assets_story_id_idx ON assets (story_id);

-- Daily story/image counters per user (one row per user per calendar day).
CREATE TABLE usage_counters (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stories_used INTEGER NOT NULL DEFAULT 0 CHECK (stories_used >= 0),
  images_used INTEGER NOT NULL DEFAULT 0 CHECK (images_used >= 0),
  UNIQUE (user_id, date)
);

CREATE INDEX usage_counters_user_id_idx ON usage_counters (user_id);
