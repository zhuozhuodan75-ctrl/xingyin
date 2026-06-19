import { useState, useCallback } from 'react'
import { Lock, Star, Volume2, Check, X, Trophy, Home, Heart, Zap, ThumbsUp } from 'lucide-react'
import { generateQuestions, getTotalLevels } from '../data/dialectWords'
import type { Question } from '../data/dialectWords'

interface GameLevelsProps {
  regionName: string
  onCheckin: () => void
  onSuccess?: () => void
  onFail?: () => void
}


export default function GameLevels({ regionName, onCheckin, onSuccess, onFail }: GameLevelsProps) {
  const [gameState, setGameState] = useState<'map' | 'playing'>('map')
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
  const totalLevels = getTotalLevels(regionName)

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
    } else {
      setComboCount(0)
      setHearts(h => h - 1)
    }

    // Auto advance after 1.2s
    setTimeout(() => {
      const newHearts = correct ? hearts : hearts - 1
      const isLastQuestion = currentQIndex >= questions.length - 1

      if (!correct && newHearts <= 0) {
        // Game over - all hearts lost
        onFail?.()
        setGameState('map')
        return
      }

      if (isLastQuestion) {
        // Level complete check
        const finalCorrectCount = correct ? correctCount + 1 : correctCount
        if (finalCorrectCount >= 3) {
          // Success!
          setCompletedLevels(prev => new Set(prev).add(currentLevel))
          setUnlockedLevel(Math.max(unlockedLevel, currentLevel + 1))
          onCheckin()
          onSuccess?.()
        } else {
          // Not enough correct answers
          onFail?.()
        }
        setGameState('map')
        return
      }

      // Next question
      setCurrentQIndex(i => i + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }, 1200)
  }

  // Level map
  if (gameState === 'map') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl card-shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#E67E22]/10 flex items-center justify-center">
                <Trophy size={20} className="text-[#E67E22]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3E3E3E]">{regionName}方言闯关</p>
                <p className="text-[11px] text-[#9E9E9E]">已完成 {completedLevels.size}/{totalLevels} 关</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <Star key={i} size={14} className={i < completedLevels.size ? 'text-[#E67E22] fill-[#E67E22]' : 'text-[#E0D8C8]'} />
              ))}
            </div>
          </div>
          <div className="h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2D5016] to-[#E67E22] rounded-full transition-all" style={{ width: `${(completedLevels.size / totalLevels) * 100}%` }} />
          </div>
        </div>

        {/* Level path */}
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
                  className={`relative flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95 ${
                    isCompleted ? 'bg-[#2D5016]/10' : isCurrent ? 'bg-[#E67E22]/10 ring-2 ring-[#E67E22]/30' : 'bg-[#F5F1E8] opacity-50'
                  }`}
                  onClick={() => isUnlocked && startLevel(level)}
                  disabled={!isUnlocked}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-[#2D5016]' : isCurrent ? 'bg-[#E67E22]' : 'bg-[#E0D8C8]'
                  }`}>
                    {isCompleted ? <Check size={20} className="text-white" /> :
                     isUnlocked ? <span className="text-white text-sm font-bold">{level}</span> :
                     <Lock size={16} className="text-[#9E9E9E]" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isCompleted ? 'text-[#2D5016]' : isCurrent ? 'text-[#E67E22]' : 'text-[#9E9E9E]'}`}>
                    {isCompleted ? '已完成' : isCurrent ? '当前' : '未解锁'}
                  </span>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E67E22] flex items-center justify-center">
                      <Zap size={10} className="text-white" />
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
            每关5道方言练习题，答对3道以上即可闯关成功！连续答对可获得连击加分。完成闯关自动打卡。
          </p>
        </div>

        {/* Words preview */}
        <div className="bg-white rounded-2xl card-shadow p-4">
          <h3 className="text-xs font-semibold text-[#3E3E3E] mb-2">今日热词</h3>
          <div className="flex flex-wrap gap-1.5">
            {['巴适', '要得', '雄起', '安逸', '晓得'].map(w => (
              <span key={w} className="px-2 py-1 bg-[#F5F1E8] rounded-full text-[10px] text-[#2D5016]">{w}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Playing
  const q = questions[currentQIndex]
  if (!q) return null

  const progress = ((currentQIndex) / questions.length) * 100

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button className="w-8 h-8 rounded-full bg-white card-shadow flex items-center justify-center" onClick={() => setGameState('map')}>
          <Home size={14} className="text-[#9E9E9E]" />
        </button>
        <div className="flex-1 mx-3">
          <div className="h-2 bg-[#E0D8C8]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#2D5016] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={14} className={i < hearts ? 'text-[#8B2635] fill-[#8B2635]' : 'text-[#E0D8C8]'} />
          ))}
        </div>
      </div>

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
            {q.type === 'listen' ? '听力题' : q.type === 'translate' ? '翻译题' : q.type === 'match' ? '配对题' : q.type === 'fill' ? '填空题' : '口语题'}
          </span>
          {q.type === 'listen' && (
            <button className="flex items-center gap-1 text-[10px] text-[#2D5016] bg-[#2D5016]/5 px-2 py-0.5 rounded-full">
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
      <p className="text-center text-[10px] text-[#9E9E9E]">
        答对3题即可闯关成功
      </p>
    </div>
  )
}
