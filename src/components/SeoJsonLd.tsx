// 路由级结构化数据（JSON-LD）注入。
// 依据《BFC 大豫园 AI 导购站增量优化方案 v1.0》：首页使用 ShoppingCenter、门店详情使用 Store，
// 且「结构化数据字段必须与页面可见内容一致」。每个调用方用独立的 id，互不覆盖。
import { useEffect } from 'react'

export default function SeoJsonLd({
  id,
  data,
}: {
  id: string
  data: Record<string, unknown> | null
}) {
  useEffect(() => {
    const elId = `jsonld-${id}`
    let el = document.getElementById(elId) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = elId
      document.head.appendChild(el)
    }
    if (!data) {
      el.remove()
      return
    }
    el.textContent = JSON.stringify(data)
    return () => {
      el?.remove()
    }
  }, [id, data])
  return null
}
