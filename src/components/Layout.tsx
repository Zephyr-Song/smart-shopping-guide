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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
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
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
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
          <div className="md:hidden border-t border-gray-100 bg-white">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium no-underline border-b border-gray-50 ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
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
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          <p>AI 智能导购系统</p>
          <p className="mt-1 text-xs text-gray-400">
            BFC 外滩金融中心 · 上海复星外滩商业有限公司
          </p>
        </div>
      </footer>

      {/* 全局浮动导购助手「点点」 */}
      <AgentAssistant />
    </div>
  )
}
