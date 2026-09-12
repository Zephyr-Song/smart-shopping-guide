import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// 与 vite.config.ts 的 base 保持一致，避免部署到根路径时路由匹配不上导致白屏。
// 部署到子路径（如 GitHub Pages）时构建期设 VITE_BASE=/smart-shopping-guide
const basename = (import.meta as any).env?.VITE_BASE || '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
