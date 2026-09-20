-- Conservative reservations are never refunded, even when a write fails.
-- This bounds stored bytes including possible orphan objects.
CREATE TABLE usage_guards (
  key TEXT PRIMARY KEY,
  used INTEGER NOT NULL CHECK(used >= 0)
);
