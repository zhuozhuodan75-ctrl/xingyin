import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard, Users, FileAudio, LogOut, Shield,
} from 'lucide-react'
import XiangyinLogo from '@/components/brand/XiangyinLogo'
import { adminLogout } from '@/lib/adminAuth'

const navItems = [
  { to: '/admin/dashboard', label: '数据概览', icon: LayoutDashboard, desc: '平台数据' },
  { to: '/admin/users', label: '用户管理', icon: Users, desc: '账号与权限' },
  { to: '/admin/moderation', label: '内容审核', icon: FileAudio, desc: '音视频作品' },
]

const pageTitles: Record<string, string> = {
  '/admin/dashboard': '数据概览',
  '/admin/users': '用户管理',
  '/admin/moderation': '内容审核',
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTitle = pageTitles[location.pathname] ?? '管理后台'

  const handleLogout = async () => {
    await adminLogout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-[#EEF1F5]">
      {/* Sidebar */}
      <aside className="w-[272px] shrink-0 flex flex-col bg-gradient-to-b from-[#1a3310] via-[#2D5016] to-[#1e3a12] text-white relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute bottom-32 -left-16 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Brand */}
        <div className="relative px-6 pt-8 pb-6">
          <XiangyinLogo variant="wordmark" size={88} dark className="px-1" />
          <p className="text-[12px] text-white/45 mt-3 pl-1 tracking-wide">管理后台</p>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-4 py-2">
          <p className="px-3 mb-3 text-[11px] font-semibold text-white/40 uppercase tracking-[0.15em]">
            功能菜单
          </p>
          <ul className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border-l-[3px] border-[#E67E22] pl-[13px]'
                          : 'text-white/75 hover:bg-white/10 hover:text-white border-l-[3px] border-transparent pl-4'
                      }`
                    }
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      location.pathname === item.to ? 'bg-[#E67E22]/25' : 'bg-white/8 group-hover:bg-white/12'
                    }`}>
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[15px] font-semibold leading-tight">{item.label}</span>
                      <span className="block text-[11px] text-white/45 mt-0.5">{item.desc}</span>
                    </div>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/8">
            <div className="w-9 h-9 rounded-full bg-[#E67E22]/30 flex items-center justify-center">
              <Shield size={16} className="text-white/90" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white/90 truncate">管理员</p>
              <p className="text-[11px] text-white/45">乡音运营中心</p>
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            onClick={() => void handleLogout()}
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] bg-white/80 backdrop-blur-md border-b border-[#E8EBEF] flex items-center px-8 shrink-0 sticky top-0 z-10">
          <div>
            <p className="text-[11px] text-[#aaa] tracking-wide">乡音 · 管理后台</p>
            <p className="text-[15px] font-semibold text-[#333] -mt-0.5">{currentTitle}</p>
          </div>
          <a
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2D5016] hover:text-[#1a3310] px-4 py-2 rounded-lg hover:bg-[#2D5016]/5 transition-colors"
          >
            返回用户端
            <span aria-hidden>→</span>
          </a>
        </header>

        <main
          className="flex-1 overflow-auto p-8"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(45,80,22,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(230,126,34,0.03) 0%, transparent 50%)',
          }}
        >
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
