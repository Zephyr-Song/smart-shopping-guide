-- 让小红书笔记也能像大众点评那样按「前端店名」匹配（方案：修复笔记不显示的根因）
-- 旧表只有 brand 列，且 API 用 `WHERE brand = ?` 精确匹配前端店名；
-- 当 D1 里的 brand 与前端 store.name 不完全一致时，笔记就显示不出来。
-- 新增 frontend 列后，API 改为 `brand = ? OR frontend = ?`，与 store_reviews 一致。
ALTER TABLE store_posts ADD COLUMN frontend TEXT;
CREATE INDEX IF NOT EXISTS idx_store_posts_frontend ON store_posts(frontend, crawled_at);
