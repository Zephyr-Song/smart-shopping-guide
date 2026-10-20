// Cloudflare Pages 中间件 —— 消除静态资源软 404
//
// 问题：Pages 对「找不到的路径」会回退到 index.html，且状态码是 200 + text/html。
//      于是 /robots.txt、/sitemap.xml、/some-chunk.js 这类请求都会拿到一份 HTML，
//      搜索引擎会把 HTML 当成静态文件收录（软 404），浏览器也会把 HTML 当 JS 解析后报错。
//
// 处理：只对「看起来是静态资源」的路径收口——命中 200 + text/html 就改成真正的 404。
//      无扩展名的路径（/guide、/map 等 SPA 路由）保持原有回退行为，前端路由不受影响。
const ASSET_RE =
  /\.(?:js|mjs|cjs|css|map|json|xml|txt|webmanifest|svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|eot|mp4|webm|glb|gltf|ktx2|wasm)$/i

interface PagesContext {
  request: Request
  next(): Promise<Response>
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request } = context
  const url = new URL(request.url)

  if (!ASSET_RE.test(url.pathname)) return context.next()

  const res = await context.next()
  const type = res.headers.get('Content-Type') || ''
  // 只有「静态资源路径却返回了 HTML」才算软 404；真实资源与接口响应原样放行
  if (res.status === 200 && type.includes('text/html')) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }
  return res
}
