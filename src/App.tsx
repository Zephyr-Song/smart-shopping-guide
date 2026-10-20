import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

// 路由级拆包：首屏只加载 Layout + 首页，其余页面按需拉取。
// 改造前 9 个页面全部静态导入，初始 JS 单包 704KB（Brotli 221KB）。
// 其中「商圈分析」独占 chart.js（约 200KB+），从不进首屏却是最大单体来源。
const SmartGuide = lazy(() => import('./pages/SmartGuide'))
const MallMap = lazy(() => import('./pages/MallMap'))
const MarketingCalendar = lazy(() => import('./pages/MarketingCalendar'))
const Analytics = lazy(() => import('./pages/Analytics'))
const BrandExplore = lazy(() => import('./pages/BrandExplore'))
const Offers = lazy(() => import('./pages/Offers'))
const Architecture = lazy(() => import('./pages/Architecture'))

/** 路由切换时的占位骨架：结构与真实页面接近，避免白屏跳动 */
function RouteFallback() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-live="polite" aria-label="页面加载中">
      <div className="h-7 w-48 rounded-lg bg-bfc-gold-100" />
      <div className="h-4 w-72 rounded bg-bfc-gold-100/70" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-bfc-gold-100/50 border border-bfc-gold-200/40" />
        ))}
      </div>
      <div className="h-56 rounded-xl bg-bfc-gold-100/40 border border-bfc-gold-200/40" />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="guide"
          element={
            <Suspense fallback={<RouteFallback />}>
              <SmartGuide />
            </Suspense>
          }
        />
        <Route
          path="map"
          element={
            <Suspense fallback={<RouteFallback />}>
              <MallMap />
            </Suspense>
          }
        />
        <Route
          path="calendar"
          element={
            <Suspense fallback={<RouteFallback />}>
              <MarketingCalendar />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route
          path="brands"
          element={
            <Suspense fallback={<RouteFallback />}>
              <BrandExplore />
            </Suspense>
          }
        />
        <Route
          path="offers"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Offers />
            </Suspense>
          }
        />
        <Route
          path="architecture"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Architecture />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
