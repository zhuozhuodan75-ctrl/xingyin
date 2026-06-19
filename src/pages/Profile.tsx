import { useEffect } from 'react'
import { Settings, Grid3X3, Bookmark, Award, ChevronRight, Flame, MapPin, CalendarDays, Sparkles, ThumbsUp, Trophy } from 'lucide-react'
import { useApp } from '../App'
import { getStreakEndingOnDay, isTodayChecked, loadCheckinRecords } from '../lib/checkin'

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export default function Profile() {
  const { state, selectPost, navigate, setActiveTab, setUserListType, isLoggedIn, refreshCheckinState } = useApp()

  useEffect(() => {
    refreshCheckinState()
  }, [refreshCheckinState])

  const year = state.currentYear
  const month = state.currentMonth
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = getFirstDayOfMonth(year, month)
  const today = state.today
  const records = loadCheckinRecords()
  const todayChecked = isTodayChecked(records)

  const userPosts = state.posts.filter((_, i) => i % 2 === 0)

  const menuItems = [
    { icon: Grid3X3, label: '我的作品', desc: `${userPosts.length} 个乡音视频`, color: '#2D5016', screen: 'myWorks' as const },
    { icon: Bookmark, label: '我的宝藏卡', desc: `${state.myCards.length} 张收藏卡片`, color: '#8B2635', screen: 'myCards' as const },
    { icon: Sparkles, label: '我的收藏', desc: `${state.favorites.length} 项收藏`, color: '#E67E22', screen: 'favorites' as const },
    { icon: Award, label: '成就徽章', desc: `${state.myBadges.length} 枚已获得`, color: '#2D5016', screen: 'myBadges' as const },
    { icon: Settings, label: '设置', desc: '账号与隐私', color: '#9E9E9E', screen: 'settings' as const },
  ]

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#F5F1E8]">
      {/* Profile Header */}
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-center gap-4">
          <button
            className="relative transition-transform active:scale-95"
            onClick={() => navigate('avatarSettings')}
          >
            <img
              src={state.currentAvatar}
              alt="avatar"
              className="w-18 h-18 rounded-full object-cover border-3 border-white card-shadow"
              style={{ width: 72, height: 72 }}
            />
            <div className="absolute -bottom-1 -right-1 bg-[#2D5016] text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
              Lv.5
            </div>
          </button>
          <div className="flex-1">
            <button className="text-left" onClick={() => navigate('avatarSettings')}>
              <h2 className="text-lg font-bold text-[#3E3E3E]">{state.userNickname}</h2>
            </button>
            <p className="text-xs text-[#9E9E9E] mt-0.5 flex items-center gap-1">
              <MapPin size={10} />
              {isLoggedIn ? `@${state.userHandle}` : '未登录 · 记录乡音，留住文化的根'}
            </p>
          </div>
          <button
            className="w-9 h-9 rounded-full bg-white card-shadow flex items-center justify-center transition-transform active:scale-90"
            onClick={() => navigate('settings')}
          >
            <Settings size={16} className="text-[#9E9E9E]" />
          </button>
        </div>

        {!isLoggedIn && (
          <button
            className="w-full mt-3 py-3 bg-[#2D5016]/10 rounded-2xl flex items-center justify-center gap-2 text-[#2D5016] text-sm transition-transform active:scale-[0.98]"
            onClick={() => navigate('login')}
          >
            登录 / 注册，同步打卡与资料
          </button>
        )}

        {/* Stats - ALL CLICKABLE */}
        <div className="flex items-center justify-around mt-4 py-3 bg-white rounded-2xl card-shadow">
          <button className="flex flex-col items-center transition-transform active:scale-95" onClick={() => navigate('myWorks')}>
            <span className="text-lg font-bold text-[#3E3E3E]">{state.posts.length}</span>
            <span className="text-[11px] text-[#9E9E9E]">作品</span>
          </button>
          <div className="w-px h-8 bg-[#E0D8C8]" />
          <button className="flex flex-col items-center transition-transform active:scale-95" onClick={() => { setUserListType('liked'); navigate('userList') }}>
            <span className="text-lg font-bold text-[#3E3E3E]">1.2k</span>
            <span className="text-[11px] text-[#9E9E9E]">获赞</span>
          </button>
          <div className="w-px h-8 bg-[#E0D8C8]" />
          <button className="flex flex-col items-center transition-transform active:scale-95" onClick={() => { setUserListType('following'); navigate('userList') }}>
            <span className="text-lg font-bold text-[#3E3E3E]">86</span>
            <span className="text-[11px] text-[#9E9E9E]">关注</span>
          </button>
          <div className="w-px h-8 bg-[#E0D8C8]" />
          <button className="flex flex-col items-center transition-transform active:scale-95" onClick={() => { setUserListType('followers'); navigate('userList') }}>
            <span className="text-lg font-bold text-[#3E3E3E]">234</span>
            <span className="text-[11px] text-[#9E9E9E]">粉丝</span>
          </button>
        </div>
      </div>

      {/* 今日打卡状态（多邻国风格） */}
      {!todayChecked && (
        <div className="px-4 mb-3">
          <button
            className="w-full flex items-center gap-3 bg-gradient-to-r from-[#FF9600]/15 to-[#FF4B4B]/10 border border-[#FF9600]/30 rounded-2xl px-4 py-3 text-left transition-transform active:scale-[0.98]"
            onClick={() => { setActiveTab('discover'); navigate('discover') }}
          >
            <div className="w-10 h-10 rounded-full bg-[#FF9600] flex items-center justify-center shrink-0">
              <Trophy size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#3E3E3E]">今日还未打卡</p>
              <p className="text-[11px] text-[#9E9E9E]">去地图选地区，完成方言闯关即可打卡</p>
            </div>
            <ChevronRight size={16} className="text-[#FF9600]" />
          </button>
        </div>
      )}

      {/* Check-in Calendar - CLICKABLE */}
      <div className="px-4 mb-4">
        <button
          className="w-full bg-white rounded-2xl card-shadow p-4 text-left transition-transform active:scale-[0.98]"
          onClick={() => navigate('checkinDetail')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#2D5016]" />
              <h3 className="text-sm font-semibold text-[#3E3E3E]">每日打卡</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                <Flame size={12} className="text-[#E67E22]" />
                <span className="text-[11px] text-[#E67E22] font-medium">连续 {state.streakDays} 天</span>
              </div>
              <ChevronRight size={16} className="text-[#E0D8C8]" />
            </div>
          </div>

          <div className="text-center text-xs text-[#9E9E9E] mb-2">
            {year}年{month + 1}月
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] text-[#9E9E9E] py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {state.checkinDays.slice(0, daysInMonth).map(d => {
              const isToday = d.day === today
              const streak = d.checked
                ? getStreakEndingOnDay(records, year, month, d.day)
                : 0
              return (
                <div
                  key={d.day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium relative ${
                    isToday && d.checked
                      ? 'bg-[#58CC02] text-white'
                      : isToday
                      ? 'bg-[#FF9600]/15 text-[#FF9600] ring-1 ring-[#FF9600]'
                      : d.checked
                      ? 'bg-[#2D5016]/10 text-[#2D5016]'
                      : 'text-[#3E3E3E]'
                  }`}
                >
                  <span>{d.day}</span>
                  {d.checked && d.level && (
                    <span className="text-[6px] leading-none mt-0.5 opacity-70">Lv.{d.level}</span>
                  )}
                  {streak >= 3 && streak < 7 && <ThumbsUp size={8} className="absolute -top-0.5 -right-0.5 text-[#2D5016]" />}
                  {streak >= 7 && <Flame size={8} className="absolute -top-0.5 -right-0.5 text-[#E67E22]" />}
                </div>
              )
            })}
          </div>
        </button>
      </div>

      {/* My Works Preview */}
      <div className="px-4 mb-4">
        <button className="w-full flex items-center justify-between mb-2 text-left transition-transform active:scale-[0.98]" onClick={() => navigate('myWorks')}>
          <h3 className="text-sm font-semibold text-[#3E3E3E]">我的作品</h3>
          <span className="text-[11px] text-[#2D5016] flex items-center gap-0.5">全部 <ChevronRight size={12} /></span>
        </button>
        <div className="grid grid-cols-3 gap-2">
          {userPosts.map(post => (
            <button key={post.id} className="aspect-[3/4] rounded-xl overflow-hidden relative card-shadow transition-transform active:scale-95" onClick={() => selectPost(post.id)}>
              <img src={post.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <p className="text-white text-[10px] truncate drop-shadow">{post.region}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-[#F5F1E8] ${i < menuItems.length - 1 ? 'border-b border-[#F5F1E8]' : ''}`}
                onClick={() => navigate(item.screen)}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}12` }}>
                  <Icon size={18} style={{ color: item.color }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3E3E3E]">{item.label}</p>
                  <p className="text-[11px] text-[#9E9E9E]">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-[#E0D8C8]" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
