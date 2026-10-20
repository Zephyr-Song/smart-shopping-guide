#!/usr/bin/env node
// 构建后预渲染（增量优化方案「五个核心路由在构建阶段预渲染静态 HTML」）
//
// 做法：Vite 产出一份 dist/index.html 后，按路由生成 dist/<route>/index.html，
// 每个文件带自己的 title / description / canonical / og / JSON-LD，并在 #root 里放一段
// 可被爬虫直接读到的静态骨架（React 挂载后由 createRoot 覆盖，不会重复展示）。
//
// 为什么不做完整 SSR：方案的验收口径要求「预渲染只用于稳定骨架；数据由客户端补齐」。
// 门店/笔记/优惠都是 D1 实时数据，构建期拿不到也不该固化，所以这里只固化骨架与元信息。
//
// 附加收益：/guide 这类路径变成真实文件，Pages 不再把它们回退到 index.html（软 404 消失），
// 同时产出 404.html，未命中路径返回真正的 404。
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist')
const ORIGIN = 'https://bfc-shopping-guide.pages.dev'
const SITE = 'BFC 大豫园 AI 智能导购'

/** 路由 → 元信息与静态骨架文案 */
const ROUTES = [
  {
    path: '/',
    title: `${SITE} | 问一句就找到店`,
    description:
      'BFC 大豫园 AI 智能导购：用一句话问出店铺位置、楼层、路线、优惠与活动，AI 帮你把逛商场的决策成本降到最低。',
    h1: 'BFC 大豫园 AI 智能导购',
    lead: '问一句就能找到店：餐厅、咖啡、品牌、楼层、路线、优惠，AI 直接给答案。',
    priority: '1.0',
  },
  {
    path: '/guide',
    title: `智能导购 · ${SITE}`,
    description: '告诉 AI 你的预算、人数和场景，直接拿到可以立刻出发的 BFC 门店清单、楼层和推荐理由。',
    h1: '智能导购',
    lead: '说出预算、人数和场景，AI 给出可以直接出发的门店清单与推荐理由。',
    priority: '0.9',
  },
  {
    path: '/map',
    title: `商场地图 · ${SITE}`,
    description: 'BFC 大豫园 B2 至 L4 楼层地图，按业态筛选店铺、查看路线，解决"这家店在几楼"的问题。',
    h1: 'BFC 商场地图',
    lead: 'B2 至 L4 分层地图，按业态找店，查楼层与路线。',
    priority: '0.9',
  },
  {
    path: '/brands',
    title: `品牌探索 · ${SITE}`,
    description: '浏览 BFC 大豫园入驻品牌，按国家、品类和风格筛选，查看门店位置与品牌故事。',
    h1: '品牌探索',
    lead: '按国家、品类、风格浏览 BFC 大豫园入驻品牌。',
    priority: '0.8',
  },
  {
    path: '/offers',
    title: `限时优惠 · ${SITE}`,
    description: 'BFC 大豫园当前在售优惠与活动，按门店和品类查看，到店即可使用。',
    h1: '限时优惠',
    lead: '当前在售优惠与活动，按门店与品类查看。',
    priority: '0.8',
  },
  {
    path: '/calendar',
    title: `营销日历 · ${SITE}`,
    description: 'BFC 大豫园活动时间表，按日期查看展览、演出、快闪与节日活动安排。',
    h1: '营销日历',
    lead: '按月查看展览、演出、快闪与节日活动安排。',
    priority: '0.7',
  },
  {
    path: '/analytics',
    title: `商圈分析 · ${SITE}`,
    description: 'BFC 大豫园客流、业态与消费结构数据看板，用于评估 AI 导购对线下商业的影响。',
    h1: '商圈分析',
    lead: '客流、业态与消费结构数据看板。',
    priority: '0.5',
  },
  {
    path: '/architecture',
    title: `系统架构 · ${SITE}`,
    description: 'BFC 智能导购的技术架构说明：React SPA、Cloudflare Pages Functions 与 D1 会话记忆。',
    h1: '系统架构',
    lead: 'React SPA + Cloudflare Pages Functions + D1 的技术架构说明。',
    priority: '0.3',
    noindex: true,
  },
]

/** 静态骨架：React 挂载后被覆盖，只服务首屏感知与爬虫 */
function skeleton(route) {
  return `<div id="root"><div style="max-width:1120px;margin:0 auto;padding:48px 20px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2b2b2b">
<h1 style="font-size:28px;line-height:1.3;margin:0 0 12px">${route.h1}</h1>
<p style="font-size:15px;line-height:1.7;color:#6b6b6b;margin:0">${route.lead}</p>
</div></div>`
}

function jsonLd(route) {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE,
    url: `${ORIGIN}${route.path}`,
    inLanguage: 'zh-CN',
  }
  if (route.path !== '/') return JSON.stringify(base)
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ShoppingCenter',
    name: 'BFC 大豫园',
    alternateName: 'BFC 外滩金融中心',
    url: ORIGIN,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '中山东二路 600 号',
      addressLocality: '上海',
      addressRegion: '上海市',
      addressCountry: 'CN',
    },
    description:
      'BFC 大豫园（外滩金融中心）是位于上海外滩的商业综合体，涵盖国际精品、精致餐饮、艺术中心与生活方式业态。',
  })
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** 把 index.html 模板改写成某个路由的静态 HTML */
function render(tpl, route) {
  const url = `${ORIGIN}${route.path}`
  let html = tpl

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`)
  html = html.replace(
    /<meta name="description"[\s\S]*?>/,
    `<meta name="description" content="${escapeAttr(route.description)}" />`,
  )
  html = html.replace(/<link rel="canonical"[\s\S]*?>/, `<link rel="canonical" href="${url}" />`)
  html = html.replace(
    /<meta property="og:title"[\s\S]*?>/,
    `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
  )
  html = html.replace(
    /<meta property="og:description"[\s\S]*?>/,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
  )
  html = html.replace(/<meta property="og:url"[\s\S]*?>/, `<meta property="og:url" content="${url}" />`)

  // 禁止索引的页面（内部架构说明）加 noindex
  if (route.noindex && !/name="robots"/.test(html)) {
    html = html.replace('</head>', '  <meta name="robots" content="noindex,follow" />\n  </head>')
  }

  // 结构化数据 + 预渲染标记，插在 </head> 前
  const ld = `  <script type="application/ld+json">${jsonLd(route)}</script>\n  <meta name="prerendered" content="${route.path}" />\n`
  html = html.replace('</head>', `${ld}</head>`)

  // 骨架放进 #root
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, skeleton(route))
  return html
}

function notFoundHtml(tpl) {
  let html = tpl
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>页面不存在 · BFC 大豫园 AI 智能导购</title>')
  html = html.replace(
    /<meta name="description"[\s\S]*?>/,
    '<meta name="description" content="页面不存在，请返回 BFC 大豫园 AI 智能导购首页。" />',
  )
  html = html.replace('</head>', '  <meta name="robots" content="noindex,follow" />\n  </head>')
  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root"><div style="max-width:640px;margin:0 auto;padding:96px 20px;font-family:system-ui,sans-serif;text-align:center;color:#2b2b2b">
<h1 style="font-size:24px;margin:0 0 12px">页面不存在</h1>
<p style="color:#6b6b6b;margin:0 0 24px">这个地址没有对应内容，可能已经调整过。</p>
<a href="/" style="color:#a9843f">返回首页</a>
</div></div>`,
  )
  return html
}

async function main() {
  const indexPath = join(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('[prerender] 找不到 dist/index.html，请先执行 vite build')
    process.exit(1)
  }
  const tpl = await readFile(indexPath, 'utf8')

  // 1) 根路由直接改写 index.html
  const root = ROUTES.find(r => r.path === '/')
  await writeFile(indexPath, render(tpl, root), 'utf8')

  // 2) 其余路由生成 <route>.html
  //    用 guide.html 而不是 guide/index.html：Pages 会把 /guide 直接映射到 guide.html，
  //    不会 308 跳到 /guide/，canonical 与实际 URL 保持一致。
  for (const route of ROUTES) {
    if (route.path === '/') continue
    const name = route.path.replace(/^\//, '')
    await writeFile(join(DIST, `${name}.html`), render(tpl, route), 'utf8')
  }

  // 3) 404 页：未命中路径返回真正的 404，不再回退到首页
  await writeFile(join(DIST, '404.html'), notFoundHtml(tpl), 'utf8')

  // 4) sitemap 与 ROUTES 保持单一来源，避免两边漂移
  const urls = ROUTES.filter(r => !r.noindex)
    .map(
      r => `  <url>
    <loc>${ORIGIN}${r.path}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>${r.path === '/offers' ? 'daily' : 'weekly'}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join('\n')
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    'utf8',
  )

  console.log(`[prerender] 已生成 ${ROUTES.length} 条路由的静态 HTML + 404.html + sitemap.xml`)
}

main().catch(e => {
  console.error('[prerender] 失败：', e)
  process.exit(1)
})
