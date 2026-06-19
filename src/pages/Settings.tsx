import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  ChevronLeft, ChevronRight, User, Bell, Lock, Shield,
  HelpCircle, FileText, Trash2, LogOut, Moon, Globe,
  Smartphone, Eye, ToggleLeft, ToggleRight, Mail, ExternalLink, Send, CalendarDays, UserCog,
} from 'lucide-react'
import { useApp } from '../App'
import XiangyinLogo from '@/components/brand/XiangyinLogo'
import { enterAdminFromApp, verifyAdminRole } from '@/lib/adminAuth'
import {
  applyAppSettings,
  clearAppCache,
  estimateCacheSize,
  loadAppSettings,
  saveAppSettings,
  type AppSettings,
} from '@/lib/appSettings'

export default function Settings() {
  const { state, goBack, navigate, signOut, isLoggedIn } = useApp()
  const routerNavigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [openingAdmin, setOpeningAdmin] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings())
  const [cacheSize, setCacheSize] = useState(() => estimateCacheSize())
  const [showClearCache, setShowClearCache] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [showPasswordHint, setShowPasswordHint] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    setCacheSize(estimateCacheSize())
  }, [activeSection])

  useEffect(() => {
    if (!isLoggedIn) {
      setIsAdmin(false)
      return
    }
    void verifyAdminRole().then(setIsAdmin)
  }, [isLoggedIn])

  const handleOpenAdmin = useCallback(async () => {
    if (openingAdmin) return
    setOpeningAdmin(true)
    try {
      const ok = await enterAdminFromApp()
      if (!ok) {
        showToast('无管理员权限')
        return
      }
      routerNavigate('/admin/moderation')
    } finally {
      setOpeningAdmin(false)
    }
  }, [openingAdmin, routerNavigate, showToast])

  const persistSettings = useCallback((next: AppSettings) => {
    setSettings(next)
    saveAppSettings(next)
    applyAppSettings(next)
  }, [])

  const notifications = [
    { id: 'push', label: '推送通知', icon: Bell, iconColor: '#2D5016' },
    { id: 'reminder', label: '每日打卡提醒', icon: Bell, iconColor: '#E67E22' },
    { id: 'comment', label: '评论通知', icon: Bell, iconColor: '#8B2635' },
    { id: 'like', label: '点赞通知', icon: Bell, iconColor: '#2D5016' },
  ] as const

  const privacy = [
    { id: 'public', label: '公开个人主页', icon: Eye, iconColor: '#2D5016' },
    { id: 'location', label: '允许定位', icon: Globe, iconColor: '#8B2635' },
    { id: 'mic', label: '允许录音', icon: Smartphone, iconColor: '#2D5016' },
  ] as const

  const faqItems = [
    { id: 'checkin', q: '如何完成每日打卡？', a: '进入「发现」→ 选择地区 → 方言闯关，5 题答对 3 题以上即打卡成功，日历会自动点亮。' },
    { id: 'card', q: '宝藏卡和徽章怎么获得？', a: '连续打卡 3 天获得宝藏卡，连续 7 天获得地区徽章，可在「我的」查看。' },
    { id: 'login', q: '为什么要登录？', a: '登录后打卡记录、个人资料会同步到云端，换设备也能继续。' },
    { id: 'post', q: '如何发布乡音作品？', a: '底部「创作」→ 录音或选模板 → 生成宝藏卡并提交，审核通过后会展示在首页。' },
  ]

  const maskEmail = (email: string | null) => {
    if (!email) return '未绑定邮箱'
    const [name, domain] = email.split('@')
    if (!domain) return email
    const masked = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}****`
    return `${masked}@${domain}`
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
    setShowLogout(false)
    setActiveSection(null)
  }

  const toggleNotification = (id: string) => {
    const next = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [id]: !settings.notifications[id],
      },
    }
    persistSettings(next)
    showToast('通知设置已保存')
  }

  const togglePrivacy = (id: string) => {
    const next = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [id]: !settings.privacy[id],
      },
    }
    persistSettings(next)
    showToast('隐私设置已保存')
  }

  const handleClearCache = () => {
    clearAppCache()
    setCacheSize(estimateCacheSize())
    setShowClearCache(false)
    showToast('缓存已清除')
  }

  const handleSubmitFeedback = async () => {
    const text = feedbackText.trim()
    if (!text) {
      showToast('请先填写反馈内容')
      return
    }
    const payload = `[乡音反馈] ${state.userNickname}\n${text}`
    try {
      await navigator.clipboard.writeText(payload)
      showToast('反馈已复制，可粘贴发送至 support@xiangyin.app')
    } catch {
      showToast('反馈内容：' + text.slice(0, 40) + '…')
    }
    setFeedbackText('')
  }

  const sectionHeader = (title: string, onBack: () => void) => (
    <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
        onClick={onBack}
      >
        <ChevronLeft size={20} className="text-[#3E3E3E]" />
      </button>
      <h1 className="text-[15px] font-semibold text-[#3E3E3E]">{title}</h1>
    </div>
  )

  const toastEl = toast && (
    <div className="absolute top-4 left-4 right-4 z-[60] flex justify-center pointer-events-none">
      <div className="bg-[#2D5016] text-white text-xs px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
        {toast}
      </div>
    </div>
  )

  const menuItems = [
    { id: 'account', label: '账号与安全', icon: User, iconColor: '#2D5016', desc: '手机号、密码、绑定' },
    { id: 'notifications', label: '通知设置', icon: Bell, iconColor: '#E67E22', desc: '推送、提醒' },
    { id: 'privacy', label: '隐私设置', icon: Shield, iconColor: '#8B2635', desc: '可见性、权限' },
    { id: 'display', label: '显示设置', icon: Moon, iconColor: '#2D5016', desc: '深色模式、字体' },
    { id: 'help', label: '帮助与反馈', icon: HelpCircle, iconColor: '#2980B9', desc: '常见问题、意见反馈' },
    { id: 'about', label: '关于乡音', icon: FileText, iconColor: '#9E9E9E', desc: '版本 1.0.0' },
  ]

  const visibleMenuItems = useMemo(() => {
    if (!isAdmin) return menuItems
    return [
      {
        id: 'admin',
        label: '账号管理与审核',
        icon: UserCog,
        iconColor: '#2D5016',
        desc: '用户管理与内容审核',
        action: 'admin' as const,
      },
      ...menuItems,
    ]
  }, [isAdmin])

  if (activeSection === 'notifications') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8]">
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
            onClick={() => setActiveSection(null)}
          >
            <ChevronLeft size={20} className="text-[#3E3E3E]" />
          </button>
          <h1 className="text-[15px] font-semibold text-[#3E3E3E]">通知设置</h1>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {notifications.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < notifications.length - 1 ? 'border-b border-[#F5F1E8]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.iconColor}15` }}>
                    <Icon size={18} style={{ color: item.iconColor }} strokeWidth={1.5} />
                  </div>
                  <span className="flex-1 text-sm text-[#3E3E3E]">{item.label}</span>
                  <button onClick={() => toggleNotification(item.id)}>
                    {settings.notifications[item.id] ? (
                      <ToggleRight size={28} className="text-[#2D5016]" />
                    ) : (
                      <ToggleLeft size={28} className="text-[#E0D8C8]" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === 'privacy') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8]">
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
            onClick={() => setActiveSection(null)}
          >
            <ChevronLeft size={20} className="text-[#3E3E3E]" />
          </button>
          <h1 className="text-[15px] font-semibold text-[#3E3E3E]">隐私设置</h1>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-4">
            {privacy.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < privacy.length - 1 ? 'border-b border-[#F5F1E8]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.iconColor}15` }}>
                    <Icon size={18} style={{ color: item.iconColor }} strokeWidth={1.5} />
                  </div>
                  <span className="flex-1 text-sm text-[#3E3E3E]">{item.label}</span>
                  <button onClick={() => togglePrivacy(item.id)}>
                    {settings.privacy[item.id] ? (
                      <ToggleRight size={28} className="text-[#2D5016]" />
                    ) : (
                      <ToggleLeft size={28} className="text-[#E0D8C8]" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              onClick={() => setShowClearCache(true)}
            >
              <div className="w-9 h-9 rounded-xl bg-[#9E9E9E]/10 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-[#9E9E9E]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <span className="text-sm text-[#3E3E3E]">清除缓存</span>
                <p className="text-[10px] text-[#9E9E9E]">{cacheSize}</p>
              </div>
              <ChevronRight size={16} className="text-[#E0D8C8]" />
            </button>
          </div>
        </div>

        {showClearCache && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-8 max-w-[280px] w-full animate-scale-in text-center">
              <div className="w-12 h-12 rounded-full bg-[#E67E22]/10 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} className="text-[#E67E22]" />
              </div>
              <h3 className="text-base font-bold text-[#3E3E3E] mb-1">清除缓存</h3>
              <p className="text-xs text-[#9E9E9E] mb-4">确定要清除 {cacheSize} 的缓存数据吗？不会影响登录、打卡与个人设置。</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 h-10 bg-[#F5F1E8] rounded-xl text-sm text-[#3E3E3E] transition-transform active:scale-95"
                  onClick={() => setShowClearCache(false)}
                >
                  取消
                </button>
                <button
                  className="flex-1 h-10 bg-[#8B2635] rounded-xl text-sm text-white transition-transform active:scale-95"
                  onClick={handleClearCache}
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (activeSection === 'display') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8]">
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
            onClick={() => setActiveSection(null)}
          >
            <ChevronLeft size={20} className="text-[#3E3E3E]" />
          </button>
          <h1 className="text-[15px] font-semibold text-[#3E3E3E]">显示设置</h1>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-4">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#2D5016]/10 flex items-center justify-center shrink-0">
                <Moon size={18} className="text-[#2D5016]" strokeWidth={1.5} />
              </div>
              <span className="flex-1 text-sm text-[#3E3E3E]">深色模式</span>
              <button
                onClick={() => {
                  const next = { ...settings, darkMode: !settings.darkMode }
                  persistSettings(next)
                  showToast(next.darkMode ? '已开启护眼模式' : '已恢复亮色模式')
                }}
              >
                {settings.darkMode ? (
                  <ToggleRight size={28} className="text-[#2D5016]" />
                ) : (
                  <ToggleLeft size={28} className="text-[#E0D8C8]" />
                )}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden p-4">
            <p className="text-sm font-medium text-[#3E3E3E] mb-3">字体大小</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#9E9E9E]">小</span>
              <input
                type="range"
                min={12}
                max={20}
                value={settings.fontSize}
                onChange={e => {
                  const fontSize = Number(e.target.value)
                  persistSettings({ ...settings, fontSize })
                }}
                onMouseUp={() => showToast(`字体大小：${settings.fontSize}px`)}
                onTouchEnd={() => showToast(`字体大小：${settings.fontSize}px`)}
                className="flex-1 h-1 bg-[#E0D8C8] rounded-full accent-[#2D5016]"
              />
              <span className="text-lg text-[#9E9E9E]">大</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === 'help') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8] relative">
        {toastEl}
        {sectionHeader('帮助与反馈', () => setActiveSection(null))}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-4">
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {faqItems.map((item, i) => (
              <div key={item.id} className={i < faqItems.length - 1 ? 'border-b border-[#F5F1E8]' : ''}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                >
                  <span className="text-sm text-[#3E3E3E] font-medium">{item.q}</span>
                  <ChevronRight
                    size={16}
                    className={`text-[#E0D8C8] transition-transform ${expandedFaq === item.id ? 'rotate-90' : ''}`}
                  />
                </button>
                {expandedFaq === item.id && (
                  <p className="px-4 pb-3.5 text-xs text-[#9E9E9E] leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl card-shadow p-4">
            <h3 className="text-sm font-semibold text-[#3E3E3E] mb-2">意见反馈</h3>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="描述你遇到的问题或建议…"
              className="w-full h-24 bg-[#F5F1E8] rounded-xl p-3 text-sm text-[#3E3E3E] resize-none outline-none focus:ring-1 focus:ring-[#2D5016]/30"
            />
            <button
              className="w-full mt-3 h-11 bg-[#2D5016] text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
              onClick={() => void handleSubmitFeedback()}
            >
              <Send size={16} />
              提交反馈
            </button>
            <p className="text-[10px] text-[#9E9E9E] mt-2 text-center">反馈将复制到剪贴板，可发送至 support@xiangyin.app</p>
          </div>

          <button
            className="w-full bg-white rounded-2xl card-shadow px-4 py-3.5 flex items-center gap-3 text-left transition-transform active:scale-[0.98]"
            onClick={() => navigate('checkinDetail')}
          >
            <CalendarDays size={18} className="text-[#2D5016]" />
            <div className="flex-1">
              <p className="text-sm text-[#3E3E3E]">查看打卡日历</p>
              <p className="text-[10px] text-[#9E9E9E]">确认闯关后是否已成功打卡</p>
            </div>
            <ChevronRight size={16} className="text-[#E0D8C8]" />
          </button>
        </div>
      </div>
    )
  }

  if (activeSection === 'about') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8] relative">
        {toastEl}
        {sectionHeader('关于乡音', () => setActiveSection(null))}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          <div className="bg-white rounded-2xl card-shadow p-6 text-center mb-4">
            <XiangyinLogo variant="splash" size={120} className="mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#2D5016]" style={{ fontFamily: '"Noto Serif SC", serif' }}>乡音</h2>
            <p className="text-xs text-[#9E9E9E] mt-1 tracking-widest">听见一方水土</p>
            <p className="text-[11px] text-[#9E9E9E] mt-3">版本 1.0.0</p>
          </div>

          <div className="bg-white rounded-2xl card-shadow p-4 mb-4">
            <p className="text-sm text-[#3E3E3E] leading-relaxed">
              乡音是一款面向中国方言保护与传承的文化社交应用。记录乡音、探索地图、方言闯关、生成宝藏卡，留住文化的根。
            </p>
          </div>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <a
              href="/brand"
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F5F1E8] transition-colors active:bg-[#F5F1E8]"
            >
              <ExternalLink size={18} className="text-[#2D5016]" />
              <span className="flex-1 text-sm text-[#3E3E3E]">品牌预览页</span>
              <ChevronRight size={16} className="text-[#E0D8C8]" />
            </a>
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-[#F5F1E8]"
              onClick={() => {
                void navigator.clipboard.writeText('support@xiangyin.app')
                showToast('邮箱已复制：support@xiangyin.app')
              }}
            >
              <Mail size={18} className="text-[#2980B9]" />
              <span className="flex-1 text-sm text-[#3E3E3E]">联系邮箱</span>
              <span className="text-xs text-[#9E9E9E]">support@xiangyin.app</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === 'account') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8]">
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
            onClick={() => setActiveSection(null)}
          >
            <ChevronLeft size={20} className="text-[#3E3E3E]" />
          </button>
          <h1 className="text-[15px] font-semibold text-[#3E3E3E]">账号与安全</h1>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          {/* User card */}
          <div className="bg-white rounded-2xl card-shadow p-4 mb-4 flex items-center gap-3">
            <img src={state.currentAvatar} alt="" className="w-14 h-14 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#3E3E3E]">{state.userNickname}</p>
              <p className="text-[11px] text-[#9E9E9E]">
                {isLoggedIn ? `@${state.userHandle}` : '未登录'}
              </p>
            </div>
            {!isLoggedIn && (
              <button
                className="text-xs text-white bg-[#2D5016] px-3 py-1.5 rounded-full"
                onClick={() => navigate('login')}
              >
                登录
              </button>
            )}
          </div>

          {isLoggedIn ? (
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {[
              { label: '邮箱', value: maskEmail(state.userEmail), icon: Smartphone, onClick: () => showToast(state.userEmail ?? '未绑定邮箱') },
              { label: '修改密码', value: '', icon: Lock, onClick: () => setShowPasswordHint(true) },
              { label: '账号 ID', value: state.userHandle ?? '', icon: Shield, onClick: () => { void navigator.clipboard.writeText(state.userHandle ?? ''); showToast('账号 ID 已复制') } },
            ].map((item, i, arr) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${i < arr.length - 1 ? 'border-b border-[#F5F1E8]' : ''}`}
                  onClick={item.onClick}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2D5016]/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#2D5016]" strokeWidth={1.5} />
                  </div>
                  <span className="flex-1 text-sm text-[#3E3E3E]">{item.label}</span>
                  {item.value && <span className="text-xs text-[#9E9E9E]">{item.value}</span>}
                  <ChevronRight size={16} className="text-[#E0D8C8]" />
                </button>
              )
            })}
          </div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow p-4 text-center">
              <p className="text-sm text-[#3E3E3E] mb-1">登录乡音账号</p>
              <p className="text-[11px] text-[#9E9E9E] mb-4">同步打卡记录、个人资料与成就</p>
              <button
                className="w-full h-11 bg-[#2D5016] text-white rounded-xl text-sm"
                onClick={() => navigate('login')}
              >
                登录 / 注册
              </button>
            </div>
          )}

          {isLoggedIn && (
          <button
            className="w-full mt-4 h-12 bg-white rounded-2xl card-shadow flex items-center justify-center gap-2 text-[#8B2635] text-sm transition-transform active:scale-95"
            onClick={() => setShowLogout(true)}
          >
            <LogOut size={16} />
            退出登录
          </button>
          )}
        </div>

        {showLogout && isLoggedIn && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-8 max-w-[280px] w-full animate-scale-in text-center">
              <div className="w-12 h-12 rounded-full bg-[#8B2635]/10 flex items-center justify-center mx-auto mb-3">
                <LogOut size={24} className="text-[#8B2635]" />
              </div>
              <h3 className="text-base font-bold text-[#3E3E3E] mb-1">退出登录</h3>
              <p className="text-xs text-[#9E9E9E] mb-4">确定要退出当前账号吗？</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 h-10 bg-[#F5F1E8] rounded-xl text-sm text-[#3E3E3E] transition-transform active:scale-95"
                  onClick={() => setShowLogout(false)}
                >
                  取消
                </button>
                <button
                  className="flex-1 h-10 bg-[#8B2635] rounded-xl text-sm text-white transition-transform active:scale-95 disabled:opacity-60"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? '退出中...' : '确定'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordHint && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-8 max-w-[280px] w-full animate-scale-in text-center">
              <div className="w-12 h-12 rounded-full bg-[#2D5016]/10 flex items-center justify-center mx-auto mb-3">
                <Lock size={24} className="text-[#2D5016]" />
              </div>
              <h3 className="text-base font-bold text-[#3E3E3E] mb-1">修改密码</h3>
              <p className="text-xs text-[#9E9E9E] mb-4">请在 Supabase 登录邮件中使用「重置密码」链接，或联系管理员协助修改。</p>
              <button
                className="w-full h-10 bg-[#2D5016] rounded-xl text-sm text-white transition-transform active:scale-95"
                onClick={() => setShowPasswordHint(false)}
              >
                知道了
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main settings menu
  return (
    <div className="h-full flex flex-col bg-[#F5F1E8] relative">
      {toastEl}
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 bg-[#F5F1E8]">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* User card */}
        <button
          className="w-full bg-white rounded-2xl card-shadow p-4 mb-4 flex items-center gap-3 text-left transition-transform active:scale-[0.98]"
          onClick={() => isLoggedIn ? setActiveSection('account') : navigate('login')}
        >
          <img src={state.currentAvatar} alt="" className="w-14 h-14 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#3E3E3E]">{state.userNickname}</p>
            <p className="text-[11px] text-[#9E9E9E]">
              {isLoggedIn ? `@${state.userHandle}` : '点击登录，同步个人数据'}
            </p>
          </div>
          <ChevronRight size={16} className="text-[#E0D8C8]" />
        </button>

        {/* Menu items */}
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          {visibleMenuItems.map((item, i) => {
            const Icon = item.icon
            const isAdminEntry = 'action' in item && item.action === 'admin'
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-[#F5F1E8] ${
                  i < visibleMenuItems.length - 1 ? 'border-b border-[#F5F1E8]' : ''
                } ${isAdminEntry ? 'bg-[#2D5016]/[0.04]' : ''}`}
                disabled={isAdminEntry && openingAdmin}
                onClick={() => {
                  if (isAdminEntry) {
                    void handleOpenAdmin()
                    return
                  }
                  setActiveSection(item.id)
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.iconColor}12` }}>
                  <Icon size={18} style={{ color: item.iconColor }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#3E3E3E]">{item.label}</p>
                  <p className="text-[10px] text-[#9E9E9E]">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-[#E0D8C8]" />
              </button>
            )
          })}
        </div>

        {isLoggedIn ? (
        <button
          className="w-full mt-4 h-12 bg-white rounded-2xl card-shadow flex items-center justify-center gap-2 text-[#8B2635] text-sm transition-transform active:scale-95"
          onClick={() => setShowLogout(true)}
        >
          <LogOut size={16} />
          退出登录
        </button>
        ) : (
        <button
          className="w-full mt-4 h-12 bg-[#2D5016] rounded-2xl card-shadow flex items-center justify-center gap-2 text-white text-sm transition-transform active:scale-95"
          onClick={() => navigate('login')}
        >
          登录 / 注册
        </button>
        )}
      </div>

      {showLogout && isLoggedIn && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-8 max-w-[280px] w-full animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-[#8B2635]/10 flex items-center justify-center mx-auto mb-3">
              <LogOut size={24} className="text-[#8B2635]" />
            </div>
            <h3 className="text-base font-bold text-[#3E3E3E] mb-1">退出登录</h3>
            <p className="text-xs text-[#9E9E9E] mb-4">确定要退出当前账号吗？</p>
            <div className="flex gap-2">
              <button
                className="flex-1 h-10 bg-[#F5F1E8] rounded-xl text-sm text-[#3E3E3E] transition-transform active:scale-95"
                onClick={() => setShowLogout(false)}
              >
                取消
              </button>
              <button
                className="flex-1 h-10 bg-[#8B2635] rounded-xl text-sm text-white transition-transform active:scale-95 disabled:opacity-60"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
              >
                {loggingOut ? '退出中...' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
