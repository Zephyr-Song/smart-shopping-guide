import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 主部署：Cloudflare Pages（前端与 /api 同域），基路径为 /
// 若仍要部署到 GitHub Pages 子路径，构建时设 VITE_BASE=/smart-shopping-guide/
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // 拆包策略：把体积大、变更少、或只有个别路由用到的依赖分出独立 chunk。
    // 配合 App.tsx 的路由级 lazy，使首屏只承担 Layout + 首页 + react 运行时。
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // chart.js 只被「商圈分析」使用，必须隔离，否则会被打进首屏
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-chart'
          // three.js 只被 3D 导览页(/explore)使用，隔离成独立异步 chunk，
          // 避免被首屏 vendor 拉起（首屏不加载 3D 引擎）。
          if (id.includes('node_modules/three') || id.includes('three/')) return 'vendor-three'
          // lucide-react 图标库体积大且极少变更，独立 chunk 命中长期缓存
          if (id.includes('lucide-react')) return 'vendor-icons'
          // react / react-dom / scheduler / react-router 归入基础运行时
          return 'vendor'
        },
      },
    },
    // 只在剩余 chunk 超过 300KB 时告警，避免拆包后噪音
    chunkSizeWarningLimit: 300,
  },
  server: {
    port: 5173,
    proxy: {
      // 开发期把 /api 代理到已部署的生产后端（bfc-shopping-guide.pages.dev）。
      // 该后端只读 D1 中的大众点评/小红书数据，本地无需再起 wrangler pages dev，
      // 单条 `npm run dev` 即可看到完整探店功能。如需纯本地函数环境，
      // 可改回 http://127.0.0.1:8788 并另起 `wrangler pages dev public`（需先用生产数据播种本地 D1）。
      '/api': {
        target: 'https://bfc-shopping-guide.pages.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
