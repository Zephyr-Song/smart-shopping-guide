// 商场知识库 —— 共享类型（纯 TS，无 React / DOM，前端与 Cloudflare Worker 均可引用）

/** 单条知识库条目 */
export interface KbItem {
  id: string
  title: string
  category: '店铺' | '设施' | '服务' | '常见问题' | '政策'
  /** 用于检索/喂给大模型的正文 */
  content: string
  /** 检索用关键词（店名、品类、同义词等） */
  keywords: string[]
}
