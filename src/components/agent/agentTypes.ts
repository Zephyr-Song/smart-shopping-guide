// 小助手 Agent 智能体 —— 消息与卡片类型定义
// 这些类型被 agentEngine.ts（推理引擎）与 AgentAssistant.tsx（UI）共用。

import type { UserProfile } from '../../data/mockData'

/** 富卡片：在助手消息中渲染不同形态的内容 */
export type AgentCard =
  | StoreCardData
  | CategoryCardData
  | InfoCardData
  | ActionCardData
  | CompareCardData

/** 单个店铺卡片（小助手最常用的推荐结果形态） */
export interface StoreCardData {
  type: 'store'
  storeId: string
  name: string
  category: string
  icon?: string
  color?: string
  rating: number
  floor: string
  avgPrice: number
  heatmap: number
  /** 推荐理由（可解释性） */
  reason?: string
  /** 匹配度百分比 0-100 */
  matchPercent?: number
}

/** 品类概览卡片（如“有哪些国际精品店”） */
export interface CategoryCardData {
  type: 'category'
  name: string
  icon: string
  color: string
  count: number
}

/** 纯文本信息卡片 */
export interface InfoCardData {
  type: 'info'
  title?: string
  text: string
}

/** 可点击的动作卡片（如“去智能导购完善画像”），点击后跳转路由 */
export interface ActionCardData {
  type: 'action'
  label: string
  /** 目标路由，如 '/guide'、'/map' */
  to?: string
}

/** 两家店铺对比卡片 */
export interface CompareCardData {
  type: 'compare'
  stores: StoreCardData[]
}

export type CardType = AgentCard['type']

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  text?: string
  cards?: AgentCard[]
}

/** 多轮对话上下文：小助手会“记住”你上一句提到的店/品类/场景 */
export interface AgentContext {
  lastStoreId?: string
  lastStoreName?: string
  lastCategory?: string
  lastOccasion?: string
  /** 对话中隐式收集到的轻量画像，用于后续推荐 */
  profile?: Partial<UserProfile>
  /** 上一轮已问过人数、正在等待人数回复时记录的预算（[min,max] 区间） */
  pendingBudget?: [number, number] | null
  /** 上一轮解析出的精确预算数字（如 500），用于按人均×人数最接近排序 */
  pendingBudgetExact?: number | null
  /** 上一轮是否为餐饮意图（用于续接“问人数”流程） */
  pendingFood?: boolean
}

export interface AgentReply {
  reply: AgentMessage
  newCtx: AgentContext
}
