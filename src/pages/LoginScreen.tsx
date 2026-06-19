import { useState } from 'react'
import { ChevronLeft, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useApp } from '../App'

export default function LoginScreen() {
  const { goBack, signIn, signUp } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('乡音旅人')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('请输入邮箱')
      return
    }
    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }

    setLoading(true)
    const result = mode === 'login'
      ? await signIn(trimmedEmail, password)
      : await signUp(trimmedEmail, password, nickname.trim() || '乡音旅人')
    setLoading(false)

    if (!result.ok) {
      setError(result.message ?? '操作失败')
      return
    }

    if (result.needsEmailConfirm) {
      setSuccess(result.message ?? '请查收确认邮件')
      setMode('login')
      return
    }

    goBack()
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">
          {mode === 'login' ? '登录' : '注册'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        <div className="text-center py-6">
          <h2
            className="text-4xl font-bold text-[#2D5016]"
            style={{ fontFamily: '"Noto Serif SC", serif' }}
          >
            乡音
          </h2>
          <p className="text-xs text-[#9E9E9E] mt-2 tracking-widest">听见一方水土</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-4 space-y-3">
          {mode === 'register' && (
            <div className="flex items-center gap-3 h-11 bg-[#F5F1E8] rounded-xl px-3">
              <User size={16} className="text-[#9E9E9E] shrink-0" />
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="昵称"
                className="flex-1 bg-transparent text-sm outline-none text-[#3E3E3E]"
              />
            </div>
          )}

          <div className="flex items-center gap-3 h-11 bg-[#F5F1E8] rounded-xl px-3">
            <Mail size={16} className="text-[#9E9E9E] shrink-0" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="邮箱"
              autoComplete="email"
              className="flex-1 bg-transparent text-sm outline-none text-[#3E3E3E]"
            />
          </div>

          <div className="flex items-center gap-3 h-11 bg-[#F5F1E8] rounded-xl px-3">
            <Lock size={16} className="text-[#9E9E9E] shrink-0" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="密码（至少 6 位）"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="flex-1 bg-transparent text-sm outline-none text-[#3E3E3E]"
            />
          </div>

          {error && (
            <p className="text-xs text-[#8B2635] px-1">{error}</p>
          )}
          {success && (
            <p className="text-xs text-[#2D5016] px-1">{success}</p>
          )}

          <button
            className="w-full h-11 bg-[#2D5016] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60"
            onClick={() => void handleSubmit()}
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </div>

        <button
          className="w-full mt-4 text-sm text-[#2D5016] text-center"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
            setSuccess(null)
          }}
        >
          {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
        </button>

        <p className="text-[10px] text-[#9E9E9E] text-center mt-6 leading-relaxed px-4">
          登录后可同步打卡记录与个人资料。
          <br />
          未登录也可体验闯关与浏览内容。
        </p>
      </div>
    </div>
  )
}
