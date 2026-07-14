CREATE TABLE IF NOT EXISTS players (
  id           TEXT PRIMARY KEY,
  secret_hash  TEXT NOT NULL,
  name         TEXT NOT NULL COLLATE NOCASE UNIQUE,
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scores (
  player_id   TEXT NOT NULL REFERENCES players(id),
  mode        TEXT NOT NULL CHECK (mode IN ('easy','hard','boomer')),
  time_ms     INTEGER NOT NULL,
  achieved_at INTEGER NOT NULL,
  plays       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, mode)
);

CREATE INDEX IF NOT EXISTS idx_scores_mode_time
  ON scores (mode, time_ms, achieved_at);
