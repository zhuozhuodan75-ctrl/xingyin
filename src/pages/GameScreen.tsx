import { useState, useCallback, useRef, useEffect } from 'react'
import { Lock, Star, Volume2, Check, X, Trophy, Home, Heart, Zap, ThumbsUp, ChevronLeft, RotateCcw, Flame, CalendarDays } from 'lucide-react'
import { generateQuestions, getTotalLevels, getRegionWords, displayDialect, getLevelLabel, resolveRegionKey } from '../data/dialectWords'
import type { Question } from '../data/dialectWords'
import { useApp } from '../App'
import type { CheckinResult } from '../lib/checkin'
import { saveLevelCheckIn } from '@/lib/checkinApi'
import { fetchGameProgress, saveGameProgress } from '@/lib/gameProgressApi'

export default function GameScreen() {
  const { state, goBack, recordCheckin, navigate, refreshCheckinState } = useApp()
  const regionName = state.selectedRegionName || '四川'
  const regionKey = resolveRegionKey(regionName)
  const [gameState, setGameState] = useState<'map' | 'playing' | 'result'>('map')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [unlockedLevel, setUnlockedLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set())
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [comboCount, setComboCount] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correctCount, setCorrectCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [finalCorrect, setFinalCorrect] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null)
  const totalLevels = getTotalLevels(regionName)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/audio/frog_gua.mp3')
  }, [])

  // 进入闯关页时从云端恢复该省进度
  useEffect(() => {
    if (!state.userId) return
    let cancelled = false
    void fetchGameProgress(regionKey).then(progress => {
      if (cancelled || !progress) return
      setUnlockedLevel(Math.max(1, progress.unlockedLevel))
      setCompletedLevels(new Set(progress.completedLevels))
    })
    return () => {
      cancelled = true
    }
  }, [regionKey, state.userId])

  const playGua = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const startLevel = useCallback((level: number) => {
    const qs = generateQuestions(regionName, level)
    setQuestions(qs)
    setCurrentQIndex(0)
    setCurrentLevel(level)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setScore(0)
    setHearts(3)
    setComboCount(0)
    setCorrectCount(0)
    setShowSuccess(false)
    setGameState('playing')
  }, [regionName])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answer)
    const q = questions[currentQIndex]
    const correct = answer === q.correctAnswer
    setIsCorrect(correct)

    if (correct) {
      const newCombo = comboCount + 1
      setComboCount(newCombo)
      setScore(s => s + 20 + (newCombo > 1 ? 10 : 0))
      setCorrectCount(c => c + 1)
      playGua()
    } else {
      setComboCount(0)
      setHearts(h => h - 1)
    }

    setTimeout(() => {
      const newHearts = correct ? hearts : hearts - 1
      const isLastQuestion = currentQIndex >= questions.length - 1

      if (!correct && newHearts <= 0) {
        setFinalCorrect(correctCount)
        setFinalScore(score)
        setGameState('result')
        return
      }

      if (isLastQuestion) {
        const finalCorrectCount = correct ? correctCount + 1 : correctCount
        const finalScoreValue = correct ? score + 20 + (comboCount > 1 ? 10 : 0) : score
        setFinalCorrect(finalCorrectCount)
        setFinalScore(finalScoreValue)
        if (finalCorrectCount >= 3) {
          const newCompleted = [...completedLevels, currentLevel]
          const newUnlocked = Math.max(unlockedLevel, currentLevel + 1)
          setCompletedLevels(prev => new Set(prev).add(currentLevel))
          setUnlockedLevel(newUnlocked)
          setShowSuccess(true)
          playGua()
          const result = recordCheckin(regionName, currentLevel)
          setCheckinResult(result)
          refreshCheckinState()
          void (async () => {
            await saveLevelCheckIn(currentLevel, state.userId, regionKey)
            const progressOk = await saveGameProgress({
              region: regionKey,
              completedLevels: newCompleted,
              unlockedLevel: newUnlocked,
              bestScore: finalScoreValue,
            })
            if (!progressOk) {
              console.warn('[闯关进度] 云端未写入，请确认已登录并在 Table Editor 查看 game_progress 表')
            }
          })()
        }
        setGameState('result')
        return
      }

      setCurrentQIndex(i => i + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }, 1200)
  }

  // Level map view
  if (gameState === 'map') {
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8]">
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 bg-[#F5F1E8]">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90" onClick={goBack}>
            <ChevronLeft size={20} className="text-[#3E3E3E]" />
          </button>
          <div className="flex-1">
            <h1 className="text-[15px] font-semibold text-[#3E3E3E]">{regionName}方言闯关</h1>
            <p className="text-[10px] text-[#9E9E9E]">已完成 {completedLevels.size}/{totalLevels} 关</p>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90" onClick={goBack}>
            <Home size={16} className="text-[#9E9E9E]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-4">
          {/* Progress */}
          <div className="bg-white rounded-2xl card-shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E67E22]/10 flex items-center justify-center">
                  <Trophy size={20} className="text-[#E67E22]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3E3E3E]">闯关进度</p>
                  <p className="text-[11px] text-[#9E9E9E]">每关5题，答对3题过关</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalLevels }, (_, i) => (
                  <Star key={i} size={14} className={i < completedLevels.size ? 'text-[#E67E22] fill-[#E67E22]' : 'text-[#E0D8C8]'} />
                ))}
              </div>
            </div>
            <div className="h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#2D5016] to-[#E67E22] rounded-full transition-all" style={{ width: `${(completedLevels.size / totalLevels) * 100}%` }} />
            </div>
          </div>

          {/* Level grid */}
          <div className="bg-white rounded-2xl card-shadow p-4">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: totalLevels }, (_, i) => {
                const level = i + 1
                const isCompleted = completedLevels.has(level)
                const isUnlocked = level <= unlockedLevel
                const isCurrent = level === unlockedLevel && !isCompleted

                return (
                  <button
                    key={level}
                    className={`relative flex flex-col items-center gap-1 py-4 rounded-xl transition-all active:scale-95 ${
                      isCompleted ? 'bg-[#2D5016]/10' : isCurrent ? 'bg-[#E67E22]/10 ring-2 ring-[#E67E22]/30' : 'bg-[#F5F1E8] opacity-50'
                    }`}
                    onClick={() => isUnlocked && startLevel(level)}
                    disabled={!isUnlocked}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-[#2D5016]' : isCurrent ? 'bg-[#E67E22]' : 'bg-[#E0D8C8]'
                    }`}>
                      {isCompleted ? <Check size={22} className="text-white" /> :
                       isUnlocked ? <span className="text-white text-base font-bold">{level}</span> :
                       <Lock size={18} className="text-[#9E9E9E]" />}
                    </div>
                    <span className={`text-[10px] font-medium ${isCompleted ? 'text-[#2D5016]' : isCurrent ? 'text-[#E67E22]' : 'text-[#9E9E9E]'}`}>
                      {getLevelLabel(level)}
                    </span>
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E67E22] flex items-center justify-center">
                        <Zap size={12} className="text-white" />
                      </div>
                    )}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1">
                        <Star size={14} className="text-[#E67E22] fill-[#E67E22]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#2D5016]/5 rounded-2xl p-4">
            <p className="text-xs text-[#3E3E3E] leading-relaxed">
              共 10 关：1-3 关学词语，4-6 关学短语，7-10 关学句子。每关含听·读·配·写·说 5 题，答对 3 题即通关打卡。
            </p>
          </div>

          {/* Words preview */}
          <div className="bg-white rounded-2xl card-shadow p-4">
            <h3 className="text-xs font-semibold text-[#3E3E3E] mb-2 flex items-center gap-1">
              <Volume2 size={12} className="text-[#2D5016]" />
              今日热词
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {getRegionWords(regionKey).slice(0, 6).map((w, i) => (
                <span key={i} className="px-2 py-1 bg-[#F5F1E8] rounded-full text-[10px] text-[#2D5016]">
                  {displayDialect(w)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result view
  if (gameState === 'result') {
    if (showSuccess) {
      const todayLabel = `${state.currentYear}年${state.currentMonth + 1}月${state.today}日`
      const streak = checkinResult?.streak ?? state.streakDays
      const isFirstToday = checkinResult?.firstCheckinToday ?? true

      return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#58CC02]/15 via-[#F5F1E8] to-[#F5F1E8] items-center justify-center px-6">
          {/* 多邻国风格：打卡成功横幅 */}
          <div className="w-full max-w-[300px] bg-white rounded-2xl card-shadow-lg p-5 mb-5 animate-scale-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9600] to-[#FF4B4B] flex items-center justify-center shadow-md">
                <Flame size={28} className="text-white fill-white" />
              </div>
              <div className="text-left">
                <p className="text-3xl font-bold text-[#FF9600] leading-none">{streak}</p>
                <p className="text-xs text-[#9E9E9E]">天连续打卡</p>
              </div>
            </div>

            <div className="bg-[#58CC02]/10 border border-[#58CC02]/30 rounded-xl px-4 py-3 text-center">
              <p className="text-base font-bold text-[#58CC02]">
                {isFirstToday ? '今日打卡成功！' : '今日已打卡，关卡已更新'}
              </p>
              <p className="text-xs text-[#3E3E3E] mt-1 flex items-center justify-center gap-1">
                <CalendarDays size={12} />
                {todayLabel} · {regionName}方言 第{currentLevel}关
              </p>
            </div>
          </div>

          <div className="relative mb-4">
            <img src="/images/mantou_gua.png" alt="" className="w-16 h-16 object-contain animate-bounce mx-auto" />
          </div>

          <h2 className="text-xl font-bold text-[#3E3E3E] mb-1">闯关成功！</h2>
          <p className="text-sm text-[#9E9E9E] mb-5">答对 {finalCorrect}/5 题，得分 {finalScore}</p>

          {checkinResult?.milestone === 3 && (
            <div className="w-full max-w-[300px] bg-[#2D5016]/5 rounded-xl px-4 py-2.5 mb-3 text-center">
              <p className="text-xs text-[#2D5016] font-medium">连续打卡 3 天！获得乡音宝藏卡</p>
            </div>
          )}
          {checkinResult?.milestone === 7 && (
            <div className="w-full max-w-[300px] bg-[#E67E22]/10 rounded-xl px-4 py-2.5 mb-3 text-center">
              <p className="text-xs text-[#E67E22] font-medium">连续打卡 7 天！获得方言达人徽章</p>
            </div>
          )}

          <div className="space-y-3 w-full max-w-[300px]">
            <button
              className="w-full h-12 bg-[#58CC02] rounded-2xl text-white text-sm font-bold transition-transform active:scale-95 shadow-[0_4px_0_#46A302]"
              onClick={() => {
                setShowSuccess(false)
                setCheckinResult(null)
                setGameState('map')
              }}
            >
              继续闯关
            </button>
            <button
              className="w-full h-11 bg-white rounded-2xl text-[#2D5016] text-sm font-medium card-shadow transition-transform active:scale-95"
              onClick={() => navigate('checkinDetail')}
            >
              查看打卡日历
            </button>
            <button
              className="w-full h-10 text-[#9E9E9E] text-xs transition-transform active:scale-95"
              onClick={goBack}
            >
              返回地区页面
            </button>
          </div>
        </div>
      )
    }

    // Fail
    return (
      <div className="h-full flex flex-col bg-[#F5F1E8] items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-[#8B2635]/10 flex items-center justify-center mb-4">
          <RotateCcw size={36} className="text-[#8B2635]" />
        </div>
        <h2 className="text-xl font-bold text-[#3E3E3E] mb-1">闯关失败</h2>
        <p className="text-xs text-[#9E9E9E] mb-2">别灰心，再试一次就能成功！</p>
        <div className="flex items-center gap-4 mb-6 py-3 bg-white rounded-2xl card-shadow px-6">
          <div className="text-center">
            <p className="text-lg font-bold text-[#3E3E3E]">{finalCorrect}/5</p>
            <p className="text-[10px] text-[#9E9E9E]">答对</p>
          </div>
          <div className="w-px h-8 bg-[#E0D8C8]" />
          <div className="text-center">
            <p className="text-lg font-bold text-[#3E3E3E]">{finalScore}</p>
            <p className="text-[10px] text-[#9E9E9E]">得分</p>
          </div>
        </div>
        <div className="space-y-3 w-full max-w-[260px]">
          <button
            className="w-full h-12 bg-[#2D5016] rounded-xl text-white text-sm font-medium transition-transform active:scale-95"
            onClick={() => startLevel(currentLevel)}
          >
            重新挑战
          </button>
          <button
            className="w-full h-10 bg-[#F5F1E8] rounded-xl text-[#9E9E9E] text-sm transition-transform active:scale-95"
            onClick={() => setGameState('map')}
          >
            返回关卡
          </button>
        </div>
      </div>
    )
  }

  // Playing view
  const q = questions[currentQIndex]
  if (!q) return null

  const progress = ((currentQIndex) / questions.length) * 100

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 bg-[#F5F1E8]">
        <button className="w-9 h-9 rounded-full bg-white card-shadow flex items-center justify-center transition-transform active:scale-90" onClick={() => setGameState('map')}>
          <ChevronLeft size={18} className="text-[#9E9E9E]" />
        </button>
        <div className="flex-1 mx-3">
          <div className="h-2 bg-[#E0D8C8]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#2D5016] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={16} className={i < hearts ? 'text-[#8B2635] fill-[#8B2635]' : 'text-[#E0D8C8]'} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
        {/* Score bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#9E9E9E]">第 {currentQIndex + 1}/5 题</span>
          <div className="flex items-center gap-2">
            {comboCount > 1 && (
              <span className="text-[10px] text-[#E67E22] bg-[#E67E22]/10 px-2 py-0.5 rounded-full font-medium">
                {comboCount}连击!
              </span>
            )}
            <span className="text-xs text-[#E67E22] font-medium">{score} 分</span>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl card-shadow p-5">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              q.type === 'listen' ? 'bg-[#2D5016]/10 text-[#2D5016]' :
              q.type === 'translate' ? 'bg-[#8B2635]/10 text-[#8B2635]' :
              q.type === 'match' ? 'bg-[#E67E22]/10 text-[#E67E22]' :
              q.type === 'fill' ? 'bg-blue-50 text-blue-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              {q.type === 'listen' ? '听·听力' : q.type === 'translate' ? '读·翻译' : q.type === 'match' ? '配·配对' : q.type === 'fill' ? '写·填空' : '说·口语'}
            </span>
            {q.type === 'listen' && (
              <button className="flex items-center gap-1 text-[10px] text-[#2D5016] bg-[#2D5016]/5 px-2 py-0.5 rounded-full" onClick={playGua}>
                <Volume2 size={10} /> 点击听发音
              </button>
            )}
          </div>

          {/* Question */}
          <h3 className="text-[15px] font-semibold text-[#3E3E3E] mb-2 whitespace-pre-line leading-relaxed">{q.question}</h3>

          {q.hint && !selectedAnswer && (
            <p className="text-[11px] text-[#9E9E9E] mb-4">提示：{q.hint}</p>
          )}

          {/* Options */}
          <div className="space-y-2.5 mt-5">
            {q.options?.map((opt, i) => {
              let btnClass = 'w-full text-left p-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98] border-2 '

              if (selectedAnswer === null) {
                btnClass += 'bg-[#F5F1E8] border-transparent text-[#3E3E3E] hover:bg-[#2D5016]/5 hover:border-[#2D5016]/20'
              } else if (opt === q.correctAnswer) {
                btnClass += 'bg-[#2D5016]/10 border-[#2D5016] text-[#2D5016]'
              } else if (opt === selectedAnswer && !isCorrect) {
                btnClass += 'bg-[#8B2635]/10 border-[#8B2635] text-[#8B2635]'
              } else {
                btnClass += 'bg-[#F5F1E8] border-transparent text-[#9E9E9E] opacity-50'
              }

              const optionLabels = ['A', 'B', 'C', 'D']

              return (
                <button key={i} className={btnClass} onClick={() => handleAnswer(opt)} disabled={selectedAnswer !== null}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedAnswer === null ? 'bg-white/60 text-[#9E9E9E]' :
                      opt === q.correctAnswer ? 'bg-[#2D5016] text-white' :
                      opt === selectedAnswer && !isCorrect ? 'bg-[#8B2635] text-white' :
                      'bg-white/40 text-[#9E9E9E]'
                    }`}>{optionLabels[i]}</span>
                    <span className="flex-1">{opt}</span>
                    {selectedAnswer !== null && opt === q.correctAnswer && <Check size={18} />}
                    {selectedAnswer === opt && !isCorrect && <X size={18} />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback message */}
          {selectedAnswer !== null && (
            <div className={`mt-4 text-center text-sm font-medium py-2 rounded-xl transition-all ${
              isCorrect ? 'bg-[#2D5016]/10 text-[#2D5016]' : 'bg-[#8B2635]/10 text-[#8B2635]'
            }`}>
              {isCorrect ? (
                <span className="flex items-center justify-center gap-1">
                  <ThumbsUp size={14} /> 回答正确！{comboCount > 1 && `+${comboCount}连击 bonus!`}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <X size={14} /> 答错了，正确答案是「{q.correctAnswer}」
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom tip */}
        <p className="text-center text-[10px] text-[#9E9E9E] pb-2">
          答对3题即可闯关成功
        </p>
      </div>
    </div>
  )
}

