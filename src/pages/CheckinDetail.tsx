import { useState, useEffect } from 'react'
import { ChevronLeft, Flame, ThumbsUp, Check, MapPin, X, Award } from 'lucide-react'
import { useApp } from '../App'
import { getStreakEndingOnDay, loadCheckinRecords } from '../lib/checkin'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const regionColors: Record<string, string> = {
  '四川': '#2D5016', '上海': '#8B2635', '东北': '#E67E22',
  '广东': '#C0392B', '湖南': '#D35400', '北京': '#2980B9',
  '陕西': '#8E44AD', '浙江': '#16A085', '江苏': '#27AE60',
}

export default function CheckinDetail() {
  const { state, goBack, navigate, dismissStreakModal, refreshCheckinState } = useApp()
  const [showModal, setShowModal] = useState<number | null>(state.showStreakModal)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    refreshCheckinState()
  }, [refreshCheckinState])

  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay()
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const records = loadCheckinRecords()

  const displayDays = state.checkinDays.map(d => {
    const streak = d.checked
      ? getStreakEndingOnDay(records, state.currentYear, state.currentMonth, d.day)
      : 0
    return {
      ...d,
      showThumb: streak >= 3 && streak < 7,
      showFlame: streak >= 7,
    }
  })

  useEffect(() => {
    if (state.showStreakModal) {
      setShowModal(state.showStreakModal)
    }
  }, [state.showStreakModal])

  const getStreakForDay = (day: number) =>
    getStreakEndingOnDay(records, state.currentYear, state.currentMonth, day)

  const handleCloseModal = () => {
    setShowModal(null)
    dismissStreakModal()
  }

  const selectedDayData = selectedDay ? state.checkinDays[selectedDay - 1] : null
  const selectedStreak = selectedDay ? getStreakForDay(selectedDay) : 0

  const totalChecked = state.checkinDays.filter(d => d.checked).length
  const currentStreak = getStreakForDay(state.today)

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">每日打卡</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* Stats cards */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white rounded-2xl card-shadow p-4 text-center">
            <p className="text-2xl font-bold text-[#2D5016]">{totalChecked}</p>
            <p className="text-[11px] text-[#9E9E9E] mt-0.5">本月打卡</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl card-shadow p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={18} className="text-[#E67E22]" />
              <p className="text-2xl font-bold text-[#E67E22]">{currentStreak}</p>
            </div>
            <p className="text-[11px] text-[#9E9E9E] mt-0.5">连续打卡</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl card-shadow p-4 text-center">
            <p className="text-2xl font-bold text-[#8B2635]">{state.myCards.length}</p>
            <p className="text-[11px] text-[#9E9E9E] mt-0.5">获得宝藏卡</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl card-shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#3E3E3E]">
              {state.currentYear}年{monthNames[state.currentMonth]}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-[#9E9E9E]">
              <span className="w-2 h-2 rounded-full bg-[#2D5016] inline-block" /> 已打卡
              <span className="w-2 h-2 rounded-full bg-[#E67E22] inline-block ml-2" /> 今天
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[11px] text-[#9E9E9E] py-1.5 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {displayDays.map(d => {
              const isToday = d.day === state.today
              const isSelected = d.day === selectedDay

              return (
                <button
                  key={d.day}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#2D5016] text-white ring-2 ring-[#2D5016] ring-offset-1'
                      : isToday
                      ? 'bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]'
                      : d.checked
                      ? 'bg-[#2D5016]/10 text-[#2D5016]'
                      : 'text-[#3E3E3E] hover:bg-[#F5F1E8]'
                  }`}
                  onClick={() => setSelectedDay(d.day === selectedDay ? null : d.day)}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : isToday ? 'text-[#E67E22]' : d.checked ? 'text-[#2D5016]' : ''}`}>
                    {d.day}
                  </span>
                  {/* Streak icons */}
                  {d.checked && d.showThumb && (
                    <ThumbsUp size={10} className={`absolute -top-0.5 -right-0.5 ${isSelected ? 'text-white' : 'text-[#2D5016]'}`} />
                  )}
                  {d.checked && d.showFlame && (
                    <Flame size={10} className={`absolute -top-0.5 -right-0.5 ${isSelected ? 'text-white' : 'text-[#E67E22]'}`} />
                  )}
                  {/* Region indicator dot */}
                  {d.checked && d.region && !d.showThumb && !d.showFlame && (
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{ background: regionColors[d.region] || '#2D5016' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day detail card */}
        {selectedDayData && selectedDay && (
          <div className="mt-3 bg-white rounded-2xl card-shadow p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#3E3E3E]">
                {state.currentYear}年{monthNames[state.currentMonth]}{selectedDay}日
              </span>
              <button onClick={() => setSelectedDay(null)}>
                <X size={16} className="text-[#9E9E9E]" />
              </button>
            </div>
            {selectedDayData.checked ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-[#2D5016]" />
                  <span className="text-sm text-[#3E3E3E]">已打卡</span>
                  {selectedDayData.region && (
                    <span className="flex items-center gap-1 text-xs text-[#9E9E9E] ml-2">
                      <MapPin size={10} />
                      {selectedDayData.region}方言
                    </span>
                  )}
                </div>
                {selectedDayData.level && (
                  <div className="flex items-center gap-2 mt-2 bg-[#2D5016]/5 rounded-lg px-3 py-2">
                    <Award size={16} className="text-[#E67E22]" />
                    <span className="text-sm text-[#3E3E3E]">闯关第 {selectedDayData.level} 关成功</span>
                    <span className="text-[10px] text-[#9E9E9E]">打卡获得乡音宝藏</span>
                  </div>
                )}
                {selectedStreak >= 3 && (
                  <div className="flex items-center gap-2 bg-[#2D5016]/5 rounded-xl p-3">
                    {selectedStreak >= 7 ? (
                      <Flame size={20} className="text-[#E67E22] shrink-0" />
                    ) : (
                      <ThumbsUp size={20} className="text-[#2D5016] shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#3E3E3E]">
                        连续打卡{selectedStreak}天{selectedStreak >= 7 ? '！太厉害了' : ''}
                      </p>
                      {selectedStreak === 3 && (
                        <p className="text-[10px] text-[#9E9E9E] mt-0.5">获得了宝藏卡奖励！</p>
                      )}
                      {selectedStreak >= 7 && (
                        <p className="text-[10px] text-[#9E9E9E] mt-0.5">获得了地区专属徽章！</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedDay === state.today ? (
              <div className="space-y-2">
                <p className="text-sm text-[#9E9E9E]">今日还未打卡</p>
                <p className="text-xs text-[#3E3E3E]">完成一次方言闯关（答对 3 题以上）即可打卡</p>
              </div>
            ) : selectedDay > state.today ? (
              <p className="text-sm text-[#9E9E9E]">这一天还没到哦</p>
            ) : (
              <p className="text-sm text-[#9E9E9E]">未打卡</p>
            )}
          </div>
        )}

        {/* Rules */}
        <div className="mt-4 bg-white rounded-2xl card-shadow p-4">
          <h3 className="text-sm font-semibold text-[#3E3E3E] mb-3">打卡规则</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#58CC02]/10 flex items-center justify-center shrink-0">
                <Check size={16} className="text-[#58CC02]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#3E3E3E]">闯关即打卡</p>
                <p className="text-[11px] text-[#9E9E9E]">方言闯关答对 3 题以上，当天日历自动标记打卡</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2D5016]/10 flex items-center justify-center shrink-0">
                <ThumbsUp size={16} className="text-[#2D5016]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#3E3E3E]">连续打卡3天</p>
                <p className="text-[11px] text-[#9E9E9E]">获得该地区专属「乡音宝藏卡」一张</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E67E22]/10 flex items-center justify-center shrink-0">
                <Flame size={16} className="text-[#E67E22]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#3E3E3E]">连续打卡7天</p>
                <p className="text-[11px] text-[#9E9E9E]">获得该地区专属「方言达人徽章」一枚</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak milestone modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-8 max-w-[300px] w-full animate-scale-in text-center">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${showModal === 7 ? 'bg-[#E67E22]/10' : 'bg-[#2D5016]/10'}`}>
              {showModal === 7 ? (
                <Flame size={32} className="text-[#E67E22]" />
              ) : (
                <ThumbsUp size={32} className="text-[#2D5016]" />
              )}
            </div>
            <h3 className="text-lg font-bold text-[#3E3E3E] mb-1">
              太棒啦！
            </h3>
            <p className="text-sm text-[#9E9E9E] mb-4">
              已经坚持打卡{showModal}天啦！{showModal === 7 ? '加油加油！' : ''}
            </p>
            {showModal === 3 && (
              <div className="bg-[#F5F1E8] rounded-xl p-3 mb-4">
                <p className="text-xs text-[#3E3E3E]">获得奖励：地区专属宝藏卡</p>
                <button
                  className="mt-2 text-xs text-[#2D5016] font-medium"
                  onClick={() => { handleCloseModal(); navigate('myCards') }}
                >
                  去查看 →
                </button>
              </div>
            )}
            {showModal === 7 && (
              <div className="bg-[#F5F1E8] rounded-xl p-3 mb-4">
                <p className="text-xs text-[#3E3E3E]">获得奖励：地区专属徽章</p>
                <button
                  className="mt-2 text-xs text-[#E67E22] font-medium"
                  onClick={() => { handleCloseModal(); navigate('myBadges') }}
                >
                  去查看 →
                </button>
              </div>
            )}
            <button
              className={`w-full h-11 rounded-xl text-sm font-medium text-white transition-transform active:scale-95 ${showModal === 7 ? 'bg-[#E67E22]' : 'bg-[#2D5016]'}`}
              onClick={handleCloseModal}
            >
              继续加油
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
