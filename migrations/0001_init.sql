-- L2/L3 智能层升级：会话记忆与审计（对应 BFC Admin 的 SQLite 持久层）
-- sessions   ：会话登记（闸门限流也查这张表的时间戳）
-- messages   ：对话审计流水（route 留痕，便于回放与分析）
-- session_memory：每会话一份结构化记忆（facts / summary / last_query / entities）

CREATE TABLE IF NOT EXISTS sessions (
  session_id  TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL,
  last_active INTEGER NOT NULL,
  ua          TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  route      TEXT,
  ts         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, ts);

CREATE TABLE IF NOT EXISTS session_memory (
  session_id TEXT PRIMARY KEY,
  facts      TEXT NOT NULL DEFAULT '{}',
  summary    TEXT NOT NULL DEFAULT '',
  last_query TEXT NOT NULL DEFAULT '',
  entities   TEXT NOT NULL DEFAULT '[]',
  turns      INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- 轻量限流：每 session 每分钟请求数（闸门用）
CREATE TABLE IF NOT EXISTS rate_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_session ON rate_events(session_id, ts);
