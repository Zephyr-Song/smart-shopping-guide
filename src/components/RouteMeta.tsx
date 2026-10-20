// 路由级 SEO 元信息：切换路由时同步 title / description / canonical / og:url。
// 依据《BFC 大豫园 AI 导购站增量优化方案 v1.0》「每个路由独立维护 title、description、canonical」。
// 说明：完整预渲染（构建期产出静态 HTML）属于第二窗口后续工作，这里先保证运行期元信息正确，
// 避免 SPA 所有路由共用同一套 title/description 被搜索引擎判为重复页面。
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'BFC 大豫园 AI 智能导购'
const ORIGIN = 'https://bfc-shopping-guide.pages.dev'

interface Meta {
  title: string
  description: string
}

const META: Record<string, Meta> = {
  '/': {
    title: `${SITE_NAME} | 问一句就找到店`,
    description:
      'BFC 大豫园 AI 智能导购：用一句话问出店铺位置、楼层、路线、优惠与活动，AI 帮你把逛商场的决策成本降到最低。',
  },
  '/guide': {
    title: `智能导购 · ${SITE_NAME}`,
    description: '告诉 AI 你的预算、人数和场景，直接拿到可以立刻出发的 BFC 门店清单、楼层和推荐理由。',
  },
  '/map': {
    title: `商场地图 · ${SITE_NAME}`,
    description: 'BFC 大豫园 B2 至 L4 楼层地图，按业态筛选店铺、查看路线，解决"这家店在几楼"的问题。',
  },
  '/brands': {
    title: `品牌探索 · ${SITE_NAME}`,
    description: '浏览 BFC 大豫园入驻品牌，按国家、品类和风格筛选，查看门店位置与品牌故事。',
  },
  '/offers': {
    title: `限时优惠 · ${SITE_NAME}`,
    description: 'BFC 大豫园当前在售优惠与活动，按门店和品类查看，到店即可使用。',
  },
  '/calendar': {
    title: `营销日历 · ${SITE_NAME}`,
    description: 'BFC 大豫园活动时间表，按日期查看展览、演出、快闪与节日活动安排。',
  },
  '/analytics': {
    title: `商圈分析 · ${SITE_NAME}`,
    description: 'BFC 大豫园客流、业态与消费结构数据看板，用于评估 AI 导购对线下商业的影响。',
  },
  '/architecture': {
    title: `系统架构 · ${SITE_NAME}`,
    description: 'BFC 智能导购的技术架构说明：React SPA、Cloudflare Pages Functions 与 D1 会话记忆。',
  },
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

export default function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = META[pathname] ?? META['/']
    const url = `${ORIGIN}${pathname === '/' ? '/' : pathname}`

    document.title = meta.title
    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [pathname])

  return null
}
