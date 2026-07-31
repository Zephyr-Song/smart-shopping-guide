import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import AgentAssistant from './agent/AgentAssistant'
import {
  ShoppingBag,
  Map,
  BarChart3,
  FlaskConical,
  Info,
  Menu,
  X,
  Sparkles,
  Calendar,
  Store,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Sparkles },
  { path: '/guide', label: '智能导购', icon: ShoppingBag },
  { path: '/map', label: '商场地图', icon: Map },
  { path: '/calendar', label: '营销日历', icon: Calendar },
  { path: '/brands', label: '品牌探索', icon: Store },
  { path: '/analytics', label: '商圈分析', icon: BarChart3 },
  { path: '/experiment', label: '实验中心', icon: FlaskConical },
  { path: '/about', label: '关于项目', icon: Info },
]

export default function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-black/5 sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lift">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-champagne ring-2 ring-white" />
              </div>
              <span className="text-lg font-bold text-ink font-display tracking-tight">
                AI 智能导购
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                      active
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {active && (
                      <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-700" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 border-none bg-transparent cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-black/5 glass">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium no-underline border-b border-black/5 ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 glass mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-ink font-display">AI 智能导购</span>
          </div>
          <p className="text-sm text-gray-500">BFC 外滩金融中心 · 上海复星外滩商业有限公司</p>
          <p className="mt-1 text-xs text-gray-400">
            基于真实商业数据的 AI 精准营销研究 · 西浦 #26054
          </p>
        </div>
      </footer>

      {/* 全局浮动导购助手「点点」 */}
      <AgentAssistant />
    </div>
  )
}
