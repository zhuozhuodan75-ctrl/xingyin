import { useRef, useEffect, useState, useCallback } from 'react'
import { Download, Share2, X, Check, RotateCcw, Send } from 'lucide-react'
import { useApp } from '../App'
import { submitPostForReview } from '@/lib/posts'

const cardTemplates = [
  { id: 0, src: '/images/card_template1.jpg', name: '祥云绿' },
  { id: 1, src: '/images/card_template2.jpg', name: '山水金' },
  { id: 2, src: '/images/bg_xuanzhi.jpg', name: '素雅宣' },
]

export default function CardGenerator() {
  const { state, goBack, navigate } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState(state.cardTemplate)
  const [cardText, setCardText] = useState(state.cardText || '巴适得板！今儿个太阳好，来碗盖碗茶嘛。')
  const [region, setRegion] = useState(state.cardRegion || '四川·成都')
  const [generated, setGenerated] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [showPublished, setShowPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 1080
    const h = 1440
    canvas.width = w
    canvas.height = h

    const template = cardTemplates[selectedTemplate]

    // Draw template background
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = template.src
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h)

      // Add semi-transparent overlay for better text readability
      ctx.fillStyle = 'rgba(245, 241, 232, 0.3)'
      ctx.fillRect(80, 200, w - 160, h - 400)

      // Draw decorative border
      ctx.strokeStyle = selectedTemplate === 0 ? '#2D5016' : selectedTemplate === 1 ? '#8B6914' : '#8B7355'
      ctx.lineWidth = 3
      ctx.strokeRect(100, 220, w - 200, h - 440)

      // Inner border
      ctx.lineWidth = 1
      ctx.strokeRect(110, 230, w - 220, h - 460)

      // Draw region stamp
      ctx.save()
      ctx.fillStyle = '#8B2635'
      ctx.font = 'bold 36px serif'
      ctx.textAlign = 'right'
      ctx.fillText(region, w - 140, 320)

      // Decorative line under region
      ctx.strokeStyle = '#8B2635'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(w - 350, 335)
      ctx.lineTo(w - 140, 335)
      ctx.stroke()
      ctx.restore()

      // Draw main text
      ctx.save()
      ctx.fillStyle = '#3E3E3E'
      ctx.textAlign = 'center'

      // Word wrap
      const maxWidth = w - 280
      const lineHeight = 70
      const fontSize = Math.min(48, Math.max(32, Math.floor(maxWidth / cardText.length * 1.8)))
      ctx.font = `${fontSize}px "Noto Serif SC", serif`

      const words = cardText.split('')
      let line = ''
      const lines: string[] = []

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line)
          line = words[i]
        } else {
          line = testLine
        }
      }
      lines.push(line)

      // Center vertically
      const totalTextHeight = lines.length * lineHeight
      const startY = (h - totalTextHeight) / 2

      lines.forEach((l, i) => {
        ctx.fillText(l, w / 2, startY + i * lineHeight)
      })
      ctx.restore()

      // Draw bottom info
      ctx.save()
      ctx.fillStyle = '#9E9E9E'
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('—— 乡音 APP · 听见一方水土 ——', w / 2, h - 200)

      // Date
      const now = new Date()
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
      ctx.font = '18px sans-serif'
      ctx.fillText(dateStr, w / 2, h - 160)
      ctx.restore()

      // Draw waveform decoration at bottom
      if (state.recordingData) {
        ctx.save()
        ctx.fillStyle = selectedTemplate === 0 ? '#2D501630' : selectedTemplate === 1 ? '#8B691430' : '#8B735530'
        const barCount = 40
        const barWidth = 4
        const barGap = 12
        const totalWidth = barCount * (barWidth + barGap)
        const startX = (w - totalWidth) / 2
        const baseY = h - 280

        for (let i = 0; i < barCount; i++) {
          const barHeight = 10 + Math.sin(i * 0.5) * 15 + Math.random() * 10
          ctx.fillRect(startX + i * (barWidth + barGap), baseY - barHeight / 2, barWidth, barHeight)
        }
        ctx.restore()
      }

      setGenerated(true)
    }
  }, [selectedTemplate, cardText, region, state.recordingData])

  useEffect(() => {
    drawCard()
  }, [drawCard])

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `乡音宝藏卡_${region}_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleShare = () => {
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handlePublish = async () => {
    if (!state.userId) {
      navigate('login')
      return
    }

    setPublishing(true)
    const result = await submitPostForReview({
      region,
      dialectText: cardText,
      coverUrl: cardTemplates[selectedTemplate].src,
      duration: state.recordingData?.duration ?? 0,
    })
    setPublishing(false)

    if (!result.ok) {
      alert(result.message ?? '提交失败')
      return
    }

    setShowPublished(true)
    setTimeout(() => setShowPublished(false), 2500)
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <X size={18} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">宝藏卡预览</h1>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2D5016] transition-transform active:scale-90"
          onClick={handleSave}
        >
          <Download size={16} className="text-white" />
        </button>
      </div>

      {/* Canvas Preview */}
      <div className="flex-1 px-4 py-2 flex items-center justify-center min-h-0">
        <div className="relative w-full h-full max-w-[340px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full rounded-xl card-shadow-lg object-contain"
            style={{ display: generated ? 'block' : 'none' }}
          />
          {!generated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#2D5016] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-4 pb-4 space-y-3">
        {/* Template selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[#9E9E9E] shrink-0">模板</span>
          {cardTemplates.map(t => (
            <button
              key={t.id}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                selectedTemplate === t.id ? 'bg-[#2D5016] text-white' : 'bg-white text-[#3E3E3E] card-shadow'
              }`}
              onClick={() => setSelectedTemplate(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Text edit */}
        <div>
          <input
            type="text"
            value={cardText}
            onChange={e => setCardText(e.target.value)}
            className="w-full h-10 bg-white rounded-xl px-3 text-sm border border-[#E0D8C8] focus:border-[#2D5016] outline-none transition-colors"
            placeholder="输入方言文案"
          />
        </div>

        {/* Region edit */}
        <div>
          <input
            type="text"
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="w-full h-10 bg-white rounded-xl px-3 text-sm border border-[#E0D8C8] focus:border-[#2D5016] outline-none transition-colors"
            placeholder="输入地区标签"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 h-11 bg-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-[#3E3E3E] card-shadow transition-transform active:scale-95"
            onClick={drawCard}
          >
            <RotateCcw size={16} />
            重新生成
          </button>
          <button
            className="flex-1 h-11 bg-[#E67E22] rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-60"
            onClick={() => void handlePublish()}
            disabled={publishing}
          >
            <Send size={16} />
            {publishing ? '提交中' : '提交审核'}
          </button>
          <button
            className="flex-1 h-11 bg-[#2D5016] rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-white transition-transform active:scale-95"
            onClick={handleShare}
          >
            <Share2 size={16} />
            分享
          </button>
        </div>
      </div>

      {/* Saved toast */}
      {showSaved && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 z-50 animate-scale-in flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#2D5016] flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
          <span className="text-white text-sm font-medium">已保存到相册</span>
        </div>
      )}

      {showPublished && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 z-50 animate-scale-in flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#E67E22] flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
          <span className="text-white text-sm font-medium text-center">已提交审核<br />通过后首页展示</span>
        </div>
      )}
    </div>
  )
}
