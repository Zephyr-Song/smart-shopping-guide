// GET /api/scenes
// 3D 场景清单 API（增量优化方案第三窗口「资源清单 API 与 R2 目录」）。
//
// 返回当前可用 / 计划中场景的清单，供前端在空闲时拉取并决定加载哪一场景。
// 字段对齐方案要求：model / textureFormat / poster / fileSize / version / cameraStart / a11yNote。
//
// 现状说明（诚实标注，便于后续验收）：
//   - 当前唯一已上线的场景是 /explore 的「程序化 BFC 立体导览」（不依赖外部 GLB，
//     由 three.js 即时生成），故 model 字段标为 procedural，无 R2 文件。
//   - 其余场景（地图分层 / 门店小剧场 / AI 导购角色）列为 planned，待 GLB 资产与
//     版权授权到位后补充 fileSize / poster / version 并切到 R2 版本化路径。
//   - R2 实际配置与版本目录为独立待办（需 Cloudflare R2 绑定 + 设计资产），此处先给出契约。
//
// 缓存：场景清单缓存 1 小时（方案缓存策略表）。

interface SceneManifest {
  id: string
  title: string
  route: string
  status: 'live' | 'planned'
  model: 'procedural' | 'glb'
  textureFormat: 'none' | 'ktx2'
  poster: string | null
  fileSize: number | null
  version: string
  cameraStart: { x: number; y: number; z: number; target: [number, number, number] }
  a11yNote: string
  fallback: string
}

const SCENES: SceneManifest[] = [
  {
    id: 'explore-bfc',
    title: 'BFC 大豫园立体导览',
    route: '/explore',
    status: 'live',
    model: 'procedural',
    textureFormat: 'none',
    poster: null,
    fileSize: null,
    version: '2026.10.20',
    cameraStart: { x: 0, y: 180, z: 360, target: [0, 0, 0] },
    a11yNote: '金色流苏幕帘自转在 prefers-reduced-motion 下自动关闭；所有交互均有键盘可达路径，Canvas 提供可读名称与热点 DOM 等价文本。',
    fallback: '现有 2D 地图与品牌探索页',
  },
  {
    id: 'map-layers',
    title: '地图分层商场 B2–L4',
    route: '/map',
    status: 'planned',
    model: 'glb',
    textureFormat: 'ktx2',
    poster: null,
    fileSize: null,
    version: 'pending',
    cameraStart: { x: 0, y: 120, z: 280, target: [0, 0, 0] },
    a11yNote: '楼层切换、店铺选择必须有键盘路径，热点具备 DOM 等价文本。',
    fallback: '现有 2D 分层地图',
  },
  {
    id: 'store-theater',
    title: '门店店面小剧场',
    route: '/brands',
    status: 'planned',
    model: 'glb',
    textureFormat: 'ktx2',
    poster: null,
    fileSize: null,
    version: 'pending',
    cameraStart: { x: 0, y: 40, z: 120, target: [0, 0, 0] },
    a11yNote: '进店、热点、商品切换均提供键盘可达路径与替代文本。',
    fallback: '现有门店详情抽屉',
  },
  {
    id: 'agent-companion',
    title: 'AI 导购角色',
    route: '/guide',
    status: 'planned',
    model: 'glb',
    textureFormat: 'ktx2',
    poster: null,
    fileSize: null,
    version: 'pending',
    cameraStart: { x: 0, y: 30, z: 90, target: [0, 0, 0] },
    a11yNote: '思考 / 说话 / 指向 / 取消均有文本状态等价播报（aria-live）。',
    fallback: '现有猫头像与文本状态',
  },
]

export async function onRequest(): Promise<Response> {
  const body = JSON.stringify({
    version: '2026.10.20',
    cacheTtl: 3600,
    scenes: SCENES,
  })
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 场景清单缓存 1 小时（方案缓存策略表）
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
