-- 大众点评 / 美团 真实探店数据（WebSearch 采集 → 推送入库 → /api/store-reviews 读取）
-- brand      : 店铺名（与前端品牌名一致，如 'DA VITTORIO SHANGHAI'）
-- source     : 数据来源 'dianping' | 'meituan'
-- rating     : 评分（字符串，如 '4.8'）
-- avg_price  : 人均消费（整数 RMB，如 864 表示 ¥864/人）
-- dishes     : 推荐菜（JSON 数组字符串，如 '["脆皮乳鸽","黄金脆带鱼"]'）
-- snippet    : 代表性评价摘要
-- url        : 大众点评 / 美团 店铺链接
-- crawled_at : 采集时间戳
CREATE TABLE IF NOT EXISTS store_reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  brand      TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT 'dianping',
  rating     TEXT,
  avg_price  INTEGER,
  dishes     TEXT,
  snippet    TEXT,
  url        TEXT,
  crawled_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_store_reviews_brand ON store_reviews(brand, crawled_at);
