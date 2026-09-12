import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 主部署：Cloudflare Pages（前端与 /api 同域），基路径为 /
// 若仍要部署到 GitHub Pages 子路径，构建时设 VITE_BASE=/smart-shopping-guide/
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
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
