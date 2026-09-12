-- 小红书真实探店笔记（MediaCrawler 本地采集 → 推送入库 → /api/store-posts 读取）
-- brand      : 店铺名（与前端品牌名一致，如 'DA VITTORIO SHANGHAI'；'__MALL__' 表示商圈级）
-- note_id    : 小红书笔记 ID（唯一，防重复入库）
CREATE TABLE IF NOT EXISTS store_posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  brand       TEXT NOT NULL,
  note_id     TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL DEFAULT '',
  desc        TEXT NOT NULL DEFAULT '',
  cover_url   TEXT,
  author      TEXT,
  avatar_url  TEXT,
  liked_count INTEGER DEFAULT 0,
  note_url    TEXT,
  note_time   TEXT,
  crawled_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_store_posts_brand ON store_posts(brand, crawled_at);
