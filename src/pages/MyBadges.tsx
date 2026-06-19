import { useState } from 'react'
import { ChevronLeft, Flame, Star, Trophy, X, MapPin, Calendar, Award, Lock } from 'lucide-react'
import { useApp } from '../App'

const allBadges = [
  { id: 'b1', region: '四川', city: '成都', name: '四川方言达人', description: '连续打卡四川方言7天', icon: 'flame', earnedDate: '2026-05-08', consecutiveDays: 7, color: '#E67E22', unlocked: true },
  { id: 'b2', region: '东北', city: '哈尔滨', name: '东北话铁子', description: '连续打卡东北方言7天', icon: 'star', earnedDate: '2026-05-20', consecutiveDays: 7, color: '#2D5016', unlocked: true },
  { id: 'b3', region: '上海', city: '黄浦', name: '上海闲话专家', description: '连续打卡上海方言7天', icon: 'trophy', earnedDate: '', consecutiveDays: 7, color: '#8B2635', unlocked: false },
  { id: 'b4', region: '广东', city: '广州', name: '粤语传承者', description: '连续打卡广东方言7天', icon: 'flame', earnedDate: '', consecutiveDays: 7, color: '#C0392B', unlocked: false },
  { id: 'b5', region: '陕西', city: '西安', name: '关中话达人', description: '连续打卡陕西方言7天', icon: 'star', earnedDate: '', consecutiveDays: 7, color: '#2980B9', unlocked: false },
  { id: 'b6', region: '湖南', city: '长沙', name: '湘语通', description: '连续打卡湖南方言7天', icon: 'trophy', earnedDate: '', consecutiveDays: 7, color: '#D35400', unlocked: false },
]

const iconMap: Record<string, typeof Flame> = {
  flame: Flame,
  star: Star,
  trophy: Trophy,
}

export default function MyBadges() {
  const { goBack } = useApp()
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)

  const badge = allBadges.find(b => b.id === selectedBadge)
  const unlockedCount = allBadges.filter(b => b.unlocked).length

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 bg-[#F5F1E8]">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">成就徽章</h1>
        <span className="text-xs text-[#9E9E9E] ml-auto">{unlockedCount}/{allBadges.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* Progress */}
        <div className="bg-white rounded-2xl card-shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#3E3E3E]">收集进度</span>
            <span className="text-xs text-[#9E9E9E]">{unlockedCount}/{allBadges.length}</span>
          </div>
          <div className="h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2D5016] to-[#E67E22] rounded-full transition-all"
              style={{ width: `${(unlockedCount / allBadges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Rule hint */}
        <div className="bg-white rounded-2xl card-shadow p-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E67E22]/10 flex items-center justify-center shrink-0">
            <Award size={20} className="text-[#E67E22]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#3E3E3E]">如何获得徽章？</p>
            <p className="text-[11px] text-[#9E9E9E]">连续打卡同一种方言7天即可获得该地区专属徽章</p>
          </div>
        </div>

        {/* Badges grid */}
        <div className="grid grid-cols-3 gap-3">
          {allBadges.map(b => {
            const Icon = iconMap[b.icon] || Flame
            return (
              <button
                key={b.id}
                className={`bg-white rounded-2xl card-shadow p-3 flex flex-col items-center transition-all active:scale-95 ${
                  !b.unlocked ? 'opacity-50' : ''
                }`}
                onClick={() => b.unlocked && setSelectedBadge(b.id)}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                  style={{ background: b.unlocked ? `${b.color}20` : '#F5F1E8' }}
                >
                  {b.unlocked ? (
                    <Icon size={28} style={{ color: b.color }} />
                  ) : (
                    <Lock size={20} className="text-[#C0B8A8]" />
                  )}
                </div>
                <p className="text-[11px] font-medium text-[#3E3E3E] text-center line-clamp-1">{b.name}</p>
                <p className="text-[9px] text-[#9E9E9E] mt-0.5">{b.region}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Badge detail modal */}
      {badge && badge.unlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-8 max-w-[280px] w-full animate-scale-in text-center">
            <button
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F5F1E8] flex items-center justify-center"
              onClick={() => setSelectedBadge(null)}
              style={{ position: 'relative', float: 'right', marginTop: -12, marginRight: -12 }}
            >
              <X size={14} className="text-[#9E9E9E]" />
            </button>

            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3"
              style={{ background: `${badge.color}20` }}
            >
              {(() => {
                const Icon = iconMap[badge.icon] || Flame
                return <Icon size={40} style={{ color: badge.color }} />
              })()}
            </div>

            <h3 className="text-lg font-bold text-[#3E3E3E] mb-1">{badge.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              <MapPin size={12} className="text-[#9E9E9E]" />
              <span className="text-xs text-[#9E9E9E]">{badge.region}·{badge.city}</span>
            </div>
            <p className="text-xs text-[#9E9E9E] mb-1">{badge.description}</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              <Calendar size={10} className="text-[#9E9E9E]" />
              <span className="text-[10px] text-[#9E9E9E]">获得于 {badge.earnedDate}</span>
            </div>

            <div className="bg-[#F5F1E8] rounded-xl p-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Flame size={14} className="text-[#E67E22]" />
                <span className="text-xs text-[#3E3E3E] font-medium">连续打卡 {badge.consecutiveDays} 天</span>
              </div>
            </div>

            <button
              className="w-full h-11 rounded-xl text-sm font-medium text-white transition-transform active:scale-95"
              style={{ background: badge.color }}
              onClick={() => setSelectedBadge(null)}
            >
              太棒了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
