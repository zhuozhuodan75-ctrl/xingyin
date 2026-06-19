import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Mic, ImagePlus, MapPin, Search, Video, X, Sparkles, RotateCcw,
} from 'lucide-react'
import { useApp } from '../App'
import { createRegionOptions } from '../data/regions'
import { submitPostForReview } from '@/lib/posts'
import { uploadMediaFile, uploadMediaFiles } from '@/lib/mediaUpload'

const MAX_IMAGES = 9

interface LocalImage {
  id: string
  file: File
  preview: string
}

export default function Create() {
  const {
    navigate, setRecordingData, setCardText, setCardRegion, setCardTemplate,
    isLoggedIn, setActiveTab, state,
  } = useApp()

  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [region, setRegion] = useState('安徽·合肥')
  const [images, setImages] = useState<LocalImage[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordComplete, setRecordComplete] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>(Array(24).fill(0.1))
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [regionSearch, setRegionSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const canSubmit = useMemo(() => {
    return Boolean(
      text.trim() || images.length > 0 || recordComplete || videoFile,
    )
  }, [text, images.length, recordComplete, videoFile])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const startWaveform = useCallback(() => {
    waveRef.current = setInterval(() => {
      setWaveformData(prev => prev.map(() => 0.15 + Math.random() * 0.85))
    }, 80)
  }, [])

  const stopWaveform = useCallback(() => {
    if (waveRef.current) {
      clearInterval(waveRef.current)
      waveRef.current = null
    }
    setWaveformData(Array(24).fill(0.1))
  }, [])

  const startRecording = useCallback(() => {
    pressTimerRef.current = setTimeout(() => {
      setIsRecording(true)
      setRecordingDuration(0)
      startTimeRef.current = Date.now()
      startWaveform()
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 100)
    }, 200)
  }, [startWaveform])

  const stopRecording = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    if (!isRecording) return
    setIsRecording(false)
    stopWaveform()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    setRecordComplete(true)
    setShowRecorder(false)
  }, [isRecording, stopWaveform])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveRef.current) clearInterval(waveRef.current)
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
      images.forEach(img => URL.revokeObjectURL(img.preview))
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [images, videoPreview])

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remain = MAX_IMAGES - images.length
    const picked = files.slice(0, remain)
    const next = picked.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...next])
    e.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(i => i.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter(i => i.id !== id)
    })
  }

  const handleVideoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const resetForm = () => {
    setText('')
    setTranslation('')
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setImages([])
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
    setRecordComplete(false)
    setRecordingDuration(0)
    setShowRecorder(false)
  }

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      showToast('请先登录后再发布')
      setTimeout(() => navigate('login'), 1200)
      return
    }
    if (!canSubmit) {
      showToast('写点文字，或添加图片/录音/视频')
      return
    }

    setSubmitting(true)
    try {
      const uploadedImages = await uploadMediaFiles(images.map(i => i.file), 'images')
      let videoUrl: string | undefined
      if (videoFile) {
        videoUrl = (await uploadMediaFile(videoFile, 'video')) ?? undefined
      }

      const result = await submitPostForReview({
        region,
        dialectText: text.trim(),
        translation: translation.trim() || undefined,
        imageUrls: uploadedImages,
        videoUrl,
        duration: recordingDuration,
      })

      if (!result.ok) {
        showToast(result.message ?? '提交失败')
        return
      }

      showToast(result.message ?? '已提交审核')
      resetForm()
      setTimeout(() => setActiveTab('profile'), 1200)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateCard = () => {
    setRecordingData({ duration: recordingDuration, waveform: waveformData })
    setCardText(text || '这里是你的乡音文案...')
    setCardRegion(region)
    setCardTemplate(0)
    navigate('cardGen')
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const filteredRegions = regionSearch
    ? createRegionOptions.filter(r => r.includes(regionSearch) || r.replace('·', '').includes(regionSearch))
    : createRegionOptions

  const regionGroups = [
    { label: '华东', regions: createRegionOptions.filter(r => ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '台湾'].some(p => r.startsWith(p))) },
    { label: '华北', regions: createRegionOptions.filter(r => ['北京', '天津', '河北', '山西', '内蒙古'].some(p => r.startsWith(p))) },
    { label: '华南', regions: createRegionOptions.filter(r => ['广东', '广西', '海南', '香港', '澳门'].some(p => r.startsWith(p))) },
    { label: '西南', regions: createRegionOptions.filter(r => ['重庆', '四川', '贵州', '云南', '西藏'].some(p => r.startsWith(p))) },
    { label: '其他', regions: createRegionOptions.filter(r => !['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '台湾', '北京', '天津', '河北', '山西', '内蒙古', '广东', '广西', '海南', '香港', '澳门', '重庆', '四川', '贵州', '云南', '西藏'].some(p => r.startsWith(p))) },
  ]

  return (
    <div className="h-full flex flex-col bg-[#EDEDED]">
      {/* 顶栏 · 类似朋友圈发表 */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 bg-[#EDEDED]">
        <button
          type="button"
          className="text-sm text-[#576B95]"
          onClick={() => setActiveTab('home')}
        >
          取消
        </button>
        <h1 className="text-[15px] font-semibold text-[#191919]">发表乡音</h1>
        <button
          type="button"
          disabled={!canSubmit || submitting}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            canSubmit && !submitting
              ? 'bg-[#2D5016] text-white'
              : 'bg-[#C8C8C8] text-white'
          }`}
          onClick={() => void handleSubmit()}
        >
          {submitting ? '发表中' : '发表'}
        </button>
      </div>

      {/* 主内容 · 可滚动 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-3">
        <div className="bg-white rounded-xl p-4 card-shadow space-y-4">
          {/* 用户头像 + 输入区 */}
          <div className="flex gap-3">
            <img
              src={state.currentAvatar}
              alt=""
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-3">
              <textarea
                className="w-full min-h-[100px] resize-none outline-none text-[15px] text-[#191919] leading-relaxed placeholder:text-[#B2B2B2] bg-transparent"
                placeholder="这一刻的乡音…"
                value={text}
                onChange={e => setText(e.target.value)}
              />

              <input
                className="w-full outline-none text-sm text-[#888] placeholder:text-[#C8C8C8] bg-transparent border-b border-[#F0F0F0] pb-2"
                placeholder="普通话释义（可选）"
                value={translation}
                onChange={e => setTranslation(e.target.value)}
              />
            </div>
          </div>

          {/* 图片九宫格（朋友圈样式，最多 9 张） */}
          <div className="grid grid-cols-3 gap-1.5">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-[#F5F5F5]">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                  onClick={() => handleRemoveImage(img.id)}
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="aspect-square rounded-md border border-[#E0E0E0] flex flex-col items-center justify-center cursor-pointer active:bg-[#F7F7F7]">
                <ImagePlus size={20} className="text-[#9E9E9E]" />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddImages}
                />
              </label>
            )}
          </div>
          {images.length > 1 && (
            <p className="text-[10px] text-[#9E9E9E]">已选 {images.length} 张，发布后可在动态里滑动查看</p>
          )}

          {/* 视频预览 */}
          {videoPreview && (
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video src={videoPreview} className="w-full h-full object-cover" controls />
              <button
                type="button"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                onClick={() => {
                  if (videoPreview) URL.revokeObjectURL(videoPreview)
                  setVideoFile(null)
                  setVideoPreview(null)
                }}
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          )}

          {/* 录音条 */}
          {recordComplete && (
            <div className="flex items-center gap-2 bg-[#F5F1E8] rounded-full px-3 py-2">
              <Mic size={14} className="text-[#2D5016]" />
              <span className="text-xs text-[#3E3E3E]">语音 {formatTime(recordingDuration)}</span>
              <button
                type="button"
                className="ml-auto text-[#9E9E9E]"
                onClick={() => { setRecordComplete(false); setRecordingDuration(0) }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 地区 */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-[#576B95] text-sm"
            onClick={() => setShowRegionPicker(true)}
          >
            <MapPin size={14} />
            <span>{region}</span>
          </button>
        </div>

        {/* 录音面板 */}
        {showRecorder && (
          <div className="mt-3 bg-white rounded-xl p-4 card-shadow flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-[2px] h-8 w-full">
              {waveformData.map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-[#2D5016] rounded-full transition-all"
                  style={{ height: `${h * 28}px` }}
                />
              ))}
            </div>
            <p className="text-xs text-[#9E9E9E]">
              {isRecording ? `录音中 ${formatTime(recordingDuration)} · 松手结束` : '按住下方按钮录音'}
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[#F5F1E8] flex items-center justify-center"
                onClick={() => setShowRecorder(false)}
              >
                <X size={16} className="text-[#9E9E9E]" />
              </button>
              <button
                type="button"
                className={`w-16 h-16 rounded-full flex items-center justify-center ${isRecording ? 'bg-[#8B2635] scale-110' : 'bg-[#2D5016]'}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
              >
                {isRecording ? <div className="w-5 h-5 bg-white rounded-sm" /> : <Mic size={26} className="text-white" />}
              </button>
              {recordComplete && (
                <button type="button" className="w-10 h-10 rounded-full bg-[#F5F1E8] flex items-center justify-center" onClick={() => { setRecordComplete(false); setRecordingDuration(0) }}>
                  <RotateCcw size={16} className="text-[#9E9E9E]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部工具栏 */}
      <div className="shrink-0 bg-white border-t border-[#E5E5E5] px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          <button type="button" className="flex flex-col items-center gap-1 text-[#576B95]" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus size={22} />
            <span className="text-[10px]">图片</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1 text-[#576B95]" onClick={() => setShowRecorder(v => !v)}>
            <Mic size={22} />
            <span className="text-[10px]">录音</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1 text-[#576B95]" onClick={() => videoInputRef.current?.click()}>
            <Video size={22} />
            <span className="text-[10px]">视频</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1 text-[#576B95]" onClick={handleGenerateCard}>
            <Sparkles size={22} />
            <span className="text-[10px]">宝藏卡</span>
          </button>
        </div>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoPick} />
        <p className="text-center text-[10px] text-[#B2B2B2] mt-2">支持纯文字、多图滑动、录音或视频，发表后进入审核</p>
      </div>

      {/* 地区选择 */}
      {showRegionPicker && (
        <div className="absolute inset-0 z-40 bg-black/30 flex items-end">
          <div className="w-full bg-white rounded-t-2xl max-h-[70%] flex flex-col animate-slide-up">
            <div className="p-3 border-b border-[#F0F0F0] flex items-center gap-2">
              <Search size={14} className="text-[#9E9E9E]" />
              <input
                className="flex-1 outline-none text-sm"
                placeholder="搜索省份…"
                value={regionSearch}
                onChange={e => setRegionSearch(e.target.value)}
              />
              <button type="button" className="text-sm text-[#576B95]" onClick={() => setShowRegionPicker(false)}>完成</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
              {regionSearch ? (
                <div className="grid grid-cols-2 gap-2">
                  {filteredRegions.map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`py-2 rounded-lg text-sm ${region === r ? 'bg-[#2D5016] text-white' : 'bg-[#F5F5F5] text-[#333]'}`}
                      onClick={() => { setRegion(r); setShowRegionPicker(false); setRegionSearch('') }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              ) : (
                regionGroups.map(g => g.regions.length > 0 && (
                  <div key={g.label} className="mb-3">
                    <p className="text-xs text-[#9E9E9E] mb-2">{g.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.regions.map(r => (
                        <button
                          key={r}
                          type="button"
                          className={`py-2 rounded-lg text-xs ${region === r ? 'bg-[#2D5016] text-white' : 'bg-[#F5F5F5]'}`}
                          onClick={() => { setRegion(r); setShowRegionPicker(false) }}
                        >
                          {r.split('·')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2D5016] text-white text-xs px-4 py-2 rounded-full shadow-lg max-w-[85%] text-center">
          {toast}
        </div>
      )}
    </div>
  )
}
