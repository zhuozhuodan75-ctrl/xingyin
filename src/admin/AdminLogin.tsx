import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Lock, Loader2 } from 'lucide-react'
import XiangyinLogo from '@/components/brand/XiangyinLogo'
import { adminLogin } from '@/lib/adminAuth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!password) {
      setError('请输入管理员密码')
      return
    }

    setLoading(true)
    const result = await adminLogin(password)
    setLoading(false)

    if (!result.ok) {
      setError(result.message ?? '登录失败')
      return
    }

    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[420px] bg-[#2D5016] text-white flex-col justify-between p-10">
        <div>
          <XiangyinLogo variant="wordmark" size={100} dark />
          <p className="text-white/60 mt-4 text-[14px] tracking-wider">管理后台</p>
        </div>
        <div className="space-y-3 text-sm text-white/80">
          <p>· 审核用户上传的音频 / 视频</p>
          <p>· 管理注册用户与账号状态</p>
          <p>· 查看注册趋势与平台数据</p>
        </div>
        <p className="text-xs text-white/40">乡音 · 听见一方水土</p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center bg-[#F0F2F5] p-6">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#3E3E3E]">管理员登录</h2>
            <p className="text-sm text-[#9E9E9E] mt-1">使用统一管理员密码进入后台</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#9E9E9E] mb-1.5 block">管理员密码</label>
              <div className="flex items-center gap-3 h-11 border border-[#E0E0E0] rounded-lg px-3 focus-within:border-[#2D5016]">
                <Lock size={16} className="text-[#9E9E9E]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
                  placeholder="请输入统一密码"
                  className="flex-1 text-sm outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-[#8B2635]">{error}</p>}

            <button
              className="w-full h-11 bg-[#2D5016] hover:bg-[#244012] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              onClick={() => void handleSubmit()}
              disabled={loading}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              登录
            </button>
          </div>

          <p className="text-[10px] text-[#BDBDBD] mt-6 leading-relaxed">
            已在 App 登录的管理员账号，输入统一密码即可进入。
            <br />
            首次请将 profiles.is_admin 设为 true（见 004_promote_zhuozhuodan_admin.sql）。
          </p>
        </div>
      </div>
    </div>
  )
}
