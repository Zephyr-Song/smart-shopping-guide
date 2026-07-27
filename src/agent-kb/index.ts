// 商场知识库 —— 汇总入口 + 轻量检索（关键词/二元组匹配，无需向量库）
import { STORES, CATEGORIES } from '../data/mockData'
import type { KbItem } from './types'
import { FACILITIES } from './facilities'
import { SERVICES } from './services'
import { FAQ } from './faq'
import { POLICIES } from './policies'
import { WEB_CONTENT } from './webContent'

// 把真实店铺数据转成知识库条目
const STORE_ITEMS: KbItem[] = STORES.map(s => ({
  id: `store-${s.id}`,
  title: s.name,
  category: '店铺' as const,
  content: `${s.name}｜品类：${s.category}｜楼层：${s.floor}｜人均：¥${s.avgPrice}｜评分：${s.rating}｜${s.description}｜标签：${s.tags.join('、')}`,
  keywords: [s.name, s.category, ...s.tags],
}))

/** 全量知识库（前端兜底与 Worker 检索共用同一份） */
export const KB_ITEMS: KbItem[] = [
  ...STORE_ITEMS,
  ...FACILITIES,
  ...SERVICES,
  ...FAQ,
  ...POLICIES,
  ...WEB_CONTENT,
]

/** 生成查询词：原文 + CJK 二元组 + 拉丁词，提升中文短查询召回 */
function tokenize(q: string): string[] {
  const text = q.toLowerCase()
  const terms = new Set<string>([text])
  // CJK 二元组
  const cjk = text.match(/[\u4e00-\u9fff]+/g) ?? []
  for (const seg of cjk) {
    for (let i = 0; i < seg.length - 1; i++) terms.add(seg.slice(i, i + 2))
  }
  // 拉丁词
  for (const w of text.split(/[^a-z0-9一-龥]+/i)) {
    if (w.length >= 2) terms.add(w.toLowerCase())
  }
  terms.delete('')
  return [...terms]
}

/**
 * 轻量检索：返回与查询最相关的知识条目（含打分），按分值降序。
 * 纯关键词/二元组打分，足够覆盖"店铺/设施/服务/政策/活动/打卡/品牌"类问答；
 * 若日后要更强语义，可替换为向量检索（embedding + 向量库）。
 */
export function searchKb(query: string, k = 6): { item: KbItem; score: number }[] {
  const terms = tokenize(query)
  const scored = KB_ITEMS.map(item => {
    let score = 0
    const hayTitle = item.title.toLowerCase()
    const hayContent = item.content.toLowerCase()
    for (const t of terms) {
      if (item.keywords.some(k => k.toLowerCase() === t)) score += 3
      if (hayTitle === t) score += 5
      else if (hayTitle.includes(t)) score += 2
      if (hayContent.includes(t)) score += 0.5
    }
    return { item, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k)
}

/**
 * 轻量检索：返回与查询最相关的 k 条知识，拼接为喂给大模型的上下文文本。
 * 即使全部命中分为 0 也返回前 k 条，避免完全无上下文。
 */
export function retrieve(query: string, k = 6): string {
  const top = searchKb(query, k)
  return top
    .map(s => `[${s.item.category}] ${s.item.title}\n${s.item.content}`)
    .join('\n\n---\n\n')
}

export { CATEGORIES }
