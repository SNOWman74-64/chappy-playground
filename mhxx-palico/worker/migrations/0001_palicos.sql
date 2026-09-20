CREATE TABLE daily_sequences (
  day TEXT PRIMARY KEY,
  value INTEGER NOT NULL CHECK(value > 0)
);
CREATE TABLE palicos (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  image_key TEXT NOT NULL UNIQUE,
  image_type TEXT NOT NULL,
  image_size INTEGER NOT NULL,
  name TEXT,
  level INTEGER,
  support_type TEXT,
  support_moves TEXT,
  skills TEXT,
  support_pattern TEXT,
  skill_pattern TEXT,
  verdict TEXT NOT NULL DEFAULT 'unreviewed' CHECK(verdict IN ('unreviewed','keep','hold','reject')),
  memo TEXT,
  request_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL
);
CREATE INDEX palicos_created ON palicos(created_at DESC, id DESC);
CREATE INDEX palicos_verdict_created ON palicos(verdict, created_at DESC, id DESC);
