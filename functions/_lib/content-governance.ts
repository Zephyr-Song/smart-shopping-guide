// 内容治理：相关性与新鲜度判定（供 /api/store-posts 使用）
//
// 依据《BFC 大豫园 AI 导购站增量优化方案 v1.0》：
//   「门店和社交内容先经过资格校验，再参与排序。品牌必须匹配，位置应命中 BFC 大豫园或明确的活动场地」
//   「新鲜度按 14 天和 45 天分档」「低相关内容在接口层直接排除，不以低分形式继续露出」
//
// 设计取舍：现有库里的笔记绝大多数没有结构化 location 字段，只能从标题/正文判断。
// 因此这里只做「确定错」的排除——命中其它商场且完全没提 BFC 的才剔除；
// 没提任何商场的一律保留但标记为 unverified，避免把整库内容清空。
// 等采集侧补上 location_tags / rights_status 字段后，结构化判定优先级更高。

/** BFC 相关正信号：命中任一即认为与本站点相关 */
const BFC_RE =
  /BFC|外滩金融中心|复星艺术中心|大豫园|中山东二路|外滩枫径|BFC外滩/i

/** 上海其它商业体 / 地标（与 BFC 无关，出现即视为位置错配） */
const OTHER_MALL_RE =
  /虹桥天地|虹桥|静安嘉里|嘉里中心|前滩太古里|兴业太古汇|太古里|新天地|国金中心|国金|IFC|环贸|iapm|港汇恒隆|恒隆广场|K11|来福士|龙之梦|万象城|环球港|大宁国际|五角场|南京西路|南京东路|淮海路|徐家汇|陆家嘴|正大广场|久光|第一八佰伴|迪士尼|日月光|打浦桥|七宝|中山公园|静安寺|人民广场|机场|浦东|松江|嘉定|青浦|宝山|闵行/i

export type Relevance = 'in_scope' | 'unverified'
export type Freshness = 'fresh' | 'aging' | 'stale'

export interface GovInput {
  title?: string | null
  desc?: string | null
  brand?: string | null
  crawled_at?: number | null
  /** 采集侧写入的授权状态；未写入视为 unknown（不拦截） */
  rights_status?: string | null
  /** 采集侧写入的结构化位置标签，如 'BFC,外滩' */
  location_tags?: string | null
}

export interface GovVerdict {
  keep: boolean
  reason?: 'rights_denied' | 'other_location' | 'stale'
  relevance: Relevance
  /** 排序权重：in_scope 优先于 unverified */
  rank: number
  freshness: Freshness
  /** 内容已存在天数（按 crawled_at 计） */
  ageDays: number | null
  updatedAt: string | null
}

const DAY = 86_400_000

/** 授权状态白名单：只有显式标记为拒绝/未授权的才剔除 */
const RIGHTS_DENIED = new Set(['denied', 'rejected', 'forbidden', 'no_rights', 'unlicensed'])

export function judgeContent(row: GovInput, now = Date.now()): GovVerdict {
  const crawled = Number(row.crawled_at || 0)
  const ageDays = crawled > 0 ? Math.floor((now - crawled) / DAY) : null
  const updatedAt = crawled > 0 ? new Date(crawled).toISOString().slice(0, 10) : null

  const freshness: Freshness =
    ageDays === null ? 'fresh' : ageDays <= 14 ? 'fresh' : ageDays <= 45 ? 'aging' : 'stale'

  // 1) 授权闸门：采集侧明确标记为不可再分发的，一律不进生产查询
  const rights = String(row.rights_status || '').toLowerCase().trim()
  if (rights && RIGHTS_DENIED.has(rights)) {
    return { keep: false, reason: 'rights_denied', relevance: 'unverified', rank: 0, freshness, ageDays, updatedAt }
  }

  // 2) 位置闸门：命中其它商场且完全没有 BFC 正信号 → 位置错配
  const text = `${row.title || ''} ${row.desc || ''} ${row.location_tags || ''}`
  const tags = String(row.location_tags || '')
  const hasBfc = BFC_RE.test(text) || /bfc/i.test(tags)
  const otherMall = OTHER_MALL_RE.test(text)
  if (!hasBfc && otherMall) {
    return { keep: false, reason: 'other_location', relevance: 'unverified', rank: 0, freshness, ageDays, updatedAt }
  }

  const relevance: Relevance = hasBfc ? 'in_scope' : 'unverified'
  return {
    keep: true,
    relevance,
    rank: relevance === 'in_scope' ? 2 : 1,
    freshness,
    ageDays,
    updatedAt,
  }
}

/** 展示用新鲜度文案 */
export function freshnessLabel(f: Freshness, updatedAt: string | null): string | null {
  if (f === 'fresh') return null
  if (f === 'aging') return updatedAt ? `更新于 ${updatedAt}` : '内容较早'
  return updatedAt ? `更新于 ${updatedAt}，可能已过期` : '可能已过期'
}
