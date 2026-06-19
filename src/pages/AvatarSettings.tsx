import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, Check, Camera, ImagePlus, Loader2 } from 'lucide-react'
import { useApp } from '../App'
import { uploadAvatarFile } from '@/lib/mediaUpload'

const baseAvatarOptions = [
  { id: 'boy', src: '/images/avatar_boy.jpg', label: '小男生' },
  { id: 'girl', src: '/images/avatar_girl.jpg', label: '小女生' },
  { id: 'young_man', src: '/images/avatar_young_man.jpg', label: '年轻男性' },
  { id: 'young_woman', src: '/images/avatar_young_woman.jpg', label: '年轻女性' },
  { id: 'cat', src: '/images/avatar_cat.jpg', label: '橘猫' },
  { id: 'dog', src: '/images/avatar_dog.jpg', label: '柴犬' },
  { id: 'crane', src: '/images/avatar_crane.jpg', label: '仙鹤' },
  { id: 'flower', src: '/images/avatar_flower.jpg', label: '樱花' },
  { id: 'deer', src: '/images/avatar_deer.jpg', label: '小鹿' },
]

const presetSrcSet = new Set(baseAvatarOptions.map(o => o.src))

function isPresetAvatar(src: string) {
  return presetSrcSet.has(src.split('?')[0])
}

export default function AvatarSettings() {
  const { state, goBack, setCurrentAvatar, setUserNickname, isLoggedIn } = useApp()
  const [selected, setSelected] = useState(state.currentAvatar)
  const [nickname, setNickname] = useState(state.userNickname)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewBlobRef = useRef<string | null>(null)

  useEffect(() => {
    setSelected(state.currentAvatar)
    setNickname(state.userNickname)
  }, [state.currentAvatar, state.userNickname])

  useEffect(() => {
    return () => {
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current)
        previewBlobRef.current = null
      }
    }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const customAvatarSrc = useMemo(() => {
    if (!selected || isPresetAvatar(selected)) return null
    if (selected === state.currentAvatar && isPresetAvatar(state.currentAvatar)) return null
    return selected.startsWith('blob:') || selected.startsWith('http') || selected.startsWith('/')
      ? selected
      : null
  }, [selected, state.currentAvatar])

  const avatarOptions = useMemo(() => {
    const opts = [...baseAvatarOptions]
    if (customAvatarSrc && !opts.some(o => o.src === customAvatarSrc)) {
      opts.unshift({ id: 'custom', src: customAvatarSrc, label: '我的上传' })
    }
    return opts
  }, [customAvatarSrc])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!isLoggedIn) {
      showToast('请先登录后再上传头像')
      return
    }

    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current)
      previewBlobRef.current = null
    }

    const preview = URL.createObjectURL(file)
    previewBlobRef.current = preview
    setSelected(preview)
    setUploading(true)

    const url = await uploadAvatarFile(file)
    setUploading(false)

    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current)
      previewBlobRef.current = null
    }

    if (!url) {
      showToast('上传失败，请检查网络或稍后重试')
      setSelected(state.currentAvatar)
      return
    }

    setSelected(url)
    showToast('图片已上传，点右上角保存生效')
  }

  const handleSave = async () => {
    if (uploading) {
      showToast('图片还在上传，请稍候')
      return
    }
    setSaving(true)
    setCurrentAvatar(selected)
    setUserNickname(nickname)
    setSaving(false)
    showToast('头像已保存')
    setTimeout(() => goBack(), 600)
  }

  const isSelected = (src: string) => selected.split('?')[0] === src.split('?')[0]

  const renderOption = (opt: typeof avatarOptions[0]) => (
    <button
      key={opt.id}
      type="button"
      className="flex flex-col items-center gap-1 transition-transform active:scale-95"
      onClick={() => setSelected(opt.src)}
    >
      <div className={`w-16 h-16 rounded-full overflow-hidden border-3 transition-all ${
        isSelected(opt.src)
          ? 'border-[#2D5016] ring-2 ring-[#2D5016]/20'
          : 'border-white'
      }`}>
        <img src={opt.src} alt={opt.label} className="w-full h-full object-cover" />
      </div>
      <span className="text-[10px] text-[#9E9E9E]">{opt.label}</span>
      {isSelected(opt.src) && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#2D5016] -mt-0.5" />
      )}
    </button>
  )

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8] relative">
      {toast && (
        <div className="absolute top-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#2D5016] text-white text-xs px-4 py-2 rounded-full shadow-lg">{toast}</div>
        </div>
      )}

      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">头像设置</h1>
        <button
          type="button"
          disabled={saving || uploading}
          className="ml-auto w-9 h-9 flex items-center justify-center rounded-full bg-[#2D5016] transition-transform active:scale-90 disabled:opacity-50"
          onClick={() => void handleSave()}
        >
          {saving ? <Loader2 size={18} className="text-white animate-spin" /> : <Check size={18} className="text-white" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="flex flex-col items-center py-6">
          <button
            type="button"
            className="relative"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={selected}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white card-shadow"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2D5016] flex items-center justify-center border-2 border-white">
              {uploading ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </div>
          </button>
          <p className="text-[10px] text-[#9E9E9E] mt-2">点击头像或下方按钮上传自定义图片</p>

          <label className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white card-shadow text-sm text-[#576B95] cursor-pointer active:scale-95 transition-transform">
            <ImagePlus size={16} />
            从相册选择
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => void handleUpload(e)}
            />
          </label>

          <div className="mt-4 w-full max-w-[240px]">
            <label className="text-xs text-[#9E9E9E] mb-1.5 block text-center">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full h-11 bg-white rounded-xl px-4 text-center text-sm font-medium border border-[#E0D8C8] focus:border-[#2D5016] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-4">
          {customAvatarSrc && (
            <div>
              <h3 className="text-xs text-[#9E9E9E] mb-2 font-medium">我的上传</h3>
              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.filter(a => a.id === 'custom').map(renderOption)}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs text-[#9E9E9E] mb-2 font-medium">人物头像</h3>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.filter(a => ['boy', 'girl', 'young_man', 'young_woman'].includes(a.id)).map(renderOption)}
            </div>
          </div>

          <div>
            <h3 className="text-xs text-[#9E9E9E] mb-2 font-medium">萌宠头像</h3>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.filter(a => ['cat', 'dog', 'deer'].includes(a.id)).map(renderOption)}
            </div>
          </div>

          <div>
            <h3 className="text-xs text-[#9E9E9E] mb-2 font-medium">自然风景</h3>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.filter(a => ['crane', 'flower'].includes(a.id)).map(renderOption)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
