import { useState } from 'react'
import { ChevronLeft, Download, Share2, X, MapPin, Calendar, Award } from 'lucide-react'
import { useApp } from '../App'

export default function MyCards() {
  const { state, goBack } = useApp()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  const card = state.myCards.find(c => c.id === selectedCard)

  const handleSave = () => {
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

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
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">我的宝藏卡</h1>
        <span className="text-xs text-[#9E9E9E] ml-auto">{state.myCards.length} 张</span>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* Earn rule hint */}
        <div className="bg-white rounded-2xl card-shadow p-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5016]/10 flex items-center justify-center shrink-0">
            <Award size={20} className="text-[#2D5016]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#3E3E3E]">如何获得宝藏卡？</p>
            <p className="text-[11px] text-[#9E9E9E]">连续打卡同一种方言3天即可获得该地区专属宝藏卡</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {state.myCards.map(c => (
            <button
              key={c.id}
              className="relative rounded-2xl overflow-hidden card-shadow transition-transform active:scale-95"
              style={{ aspectRatio: '3/4' }}
              onClick={() => setSelectedCard(c.id)}
            >
              <img src={c.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Card content overlay */}
              <div className="absolute inset-x-3 top-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/80 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    连续{c.consecutiveDays}天
                  </span>
                </div>
              </div>

              <div className="absolute inset-x-3 bottom-3">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={10} className="text-white/70" />
                  <span className="text-[10px] text-white/70">{c.region}·{c.city}</span>
                </div>
                <p className="text-sm font-bold text-white drop-shadow-lg">「{c.phrase}」</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar size={9} className="text-white/50" />
                  <span className="text-[9px] text-white/50">{c.earnedDate}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Locked cards hint */}
        <div className="mt-4 bg-white/60 rounded-2xl p-4 border border-dashed border-[#E0D8C8] text-center">
          <p className="text-xs text-[#9E9E9E]">还有更多宝藏卡等待解锁</p>
          <p className="text-[10px] text-[#9E9E9E] mt-1">坚持每日打卡，收集全国34个地区的专属宝藏卡</p>
        </div>
      </div>

      {/* Card detail modal */}
      {card && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="mx-6 w-full max-w-[300px] animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden card-shadow-lg" style={{ aspectRatio: '3/4' }}>
              <img src={card.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Close button */}
              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
                onClick={() => setSelectedCard(null)}
              >
                <X size={16} className="text-white" />
              </button>

              {/* Card details */}
              <div className="absolute inset-x-4 top-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#8B2635]/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <span className="text-white text-[10px] font-medium">乡音宝藏卡</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={14} className="text-[#E67E22]" />
                  <span className="text-white/90 text-sm font-medium">{card.region}·{card.city}</span>
                </div>
                <p className="text-white text-xl font-bold drop-shadow-lg mb-2">「{card.phrase}」</p>
                <div className="flex items-center gap-2 text-white/60 text-[10px] mb-4">
                  <Calendar size={10} />
                  <span>获得于 {card.earnedDate}</span>
                  <span>·</span>
                  <span>连续打卡{card.consecutiveDays}天</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center gap-1.5 text-white text-sm transition-transform active:scale-95"
                    onClick={handleSave}
                  >
                    <Download size={16} />
                    保存
                  </button>
                  <button
                    className="flex-1 h-10 bg-[#2D5016] rounded-xl flex items-center justify-center gap-1.5 text-white text-sm transition-transform active:scale-95"
                    onClick={() => setShowSaved(true)}
                  >
                    <Share2 size={16} />
                    分享
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved toast */}
      {showSaved && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 z-[60] animate-scale-in flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#2D5016] flex items-center justify-center">
            <Download size={20} className="text-white" />
          </div>
          <span className="text-white text-sm font-medium">已保存</span>
        </div>
      )}
    </div>
  )
}
