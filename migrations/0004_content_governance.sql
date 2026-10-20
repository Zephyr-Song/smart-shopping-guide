-- 内容治理字段（增量优化方案第三窗口：「内容记录至少补充 source、sourceUrl、crawledAt、
-- expiresAt、brandId、locationTags、category、relevanceScore 和 rightsStatus」）
--
-- 说明：现有数据的这些字段为空时，/api/store-posts 会从标题/正文做启发式判定，
-- 采集侧逐步补齐后自动切换到结构化判定（rights_status / location_tags 优先级更高）。
-- rights_status 取值约定：
--   NULL / 'unknown'  → 未审核，按内容判定放行
--   'approved'        → 已获授权
--   'denied' / 'rejected' / 'no_rights' / 'unlicensed' → 不得公开展示，接口层剔除

ALTER TABLE store_posts ADD COLUMN source TEXT;
ALTER TABLE store_posts ADD COLUMN brand_id TEXT;
ALTER TABLE store_posts ADD COLUMN location_tags TEXT;
ALTER TABLE store_posts ADD COLUMN category TEXT;
ALTER TABLE store_posts ADD COLUMN relevance_score REAL;
ALTER TABLE store_posts ADD COLUMN rights_status TEXT;
ALTER TABLE store_posts ADD COLUMN expires_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_store_posts_rights ON store_posts(rights_status);
CREATE INDEX IF NOT EXISTS idx_store_posts_crawled ON store_posts(crawled_at);

-- 点评侧同样补授权与新鲜度字段
ALTER TABLE store_reviews ADD COLUMN rights_status TEXT;
ALTER TABLE store_reviews ADD COLUMN expires_at INTEGER;
