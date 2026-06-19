import { useEffect, useMemo, useState } from 'react'
import { Search, Shield, ShieldOff, UserCog, UserMinus } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { fetchUsers, setUserActive, setUserAdmin, type AdminUserRow } from '@/lib/adminApi'
import { AdminPageHeader, AdminCard } from './AdminPageHeader'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<AdminUserRow | null>(null)

  const load = () => {
    setLoading(true)
    void fetchUsers(100)
      .then(setUsers)
      .catch(err => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    void getSupabase()?.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.nickname.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q),
    )
  }, [users, search])

  const toggleActive = async (user: AdminUserRow) => {
    if (user.is_admin) return
    try {
      await setUserActive(user.id, !user.is_active)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  const promoteToAdmin = async (user: AdminUserRow) => {
    try {
      await setUserAdmin(user.id, true)
      setConfirmTarget(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : '设置失败')
    }
  }

  const revokeAdmin = async (user: AdminUserRow) => {
    if (user.id === currentUserId) {
      alert('不能取消自己的管理员权限')
      return
    }
    if (!confirm(`确定取消「${user.nickname}」的管理员权限吗？`)) return
    try {
      await setUserAdmin(user.id, false)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="用户管理"
        description="查看注册用户，一键设为管理员或停用账号"
        action={
          <div className="flex items-center gap-2 h-10 bg-white border border-[#E8EBEF] rounded-xl px-4 w-full sm:w-72 shadow-sm">
            <Search size={16} className="text-[#aaa]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索昵称 / 用户名"
              className="flex-1 text-[14px] outline-none bg-transparent"
            />
          </div>
        }
      />

      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#9E9E9E]">加载中...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-[#8B2635]">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFBFC] text-[#888] text-[12px] uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5 font-semibold">用户</th>
                  <th className="text-left px-5 py-3.5 font-semibold">用户名</th>
                  <th className="text-left px-5 py-3.5 font-semibold">注册时间</th>
                  <th className="text-left px-5 py-3.5 font-semibold">状态</th>
                  <th className="text-left px-5 py-3.5 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-t border-[#F0F2F5] hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar_url || '/images/avatar1.jpg'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium text-[#3E3E3E]">{user.nickname}</span>
                        {user.is_admin && (
                          <span className="text-[10px] bg-[#2D5016]/10 text-[#2D5016] px-1.5 py-0.5 rounded">管理员</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#666] text-[14px]">@{user.handle}</td>
                    <td className="px-5 py-4 text-[#888] text-[13px]">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.is_active
                          ? 'bg-[#2D5016]/10 text-[#2D5016]'
                          : 'bg-[#8B2635]/10 text-[#8B2635]'
                      }`}>
                        {user.is_active ? '正常' : '已停用'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        {!user.is_admin ? (
                          <button
                            className="text-[13px] text-white bg-[#2D5016] hover:bg-[#244012] px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
                            onClick={() => setConfirmTarget(user)}
                          >
                            <UserCog size={12} /> 设为管理员
                          </button>
                        ) : user.id !== currentUserId ? (
                          <button
                            className="text-xs text-[#8B2635] hover:underline flex items-center gap-1"
                            onClick={() => void revokeAdmin(user)}
                          >
                            <UserMinus size={12} /> 取消管理员
                          </button>
                        ) : null}

                        {!user.is_admin && (
                          <button
                            className="text-xs text-[#666] hover:underline flex items-center gap-1"
                            onClick={() => void toggleActive(user)}
                          >
                            {user.is_active ? (
                              <><ShieldOff size={12} /> 停用</>
                            ) : (
                              <><Shield size={12} /> 启用</>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#9E9E9E]">暂无用户</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-[400px] w-full border border-[#E8EBEF]">
            <h3 className="text-lg font-semibold text-[#333]">设为管理员</h3>
            <p className="text-sm text-[#666] mt-2 leading-relaxed">
              确定将「<span className="font-medium text-[#3E3E3E]">{confirmTarget.nickname}</span>」设为管理员吗？
              <br />
              对方可使用统一密码登录后台，并管理用户与内容审核。
            </p>
            <div className="flex gap-2 mt-5">
              <button
                className="flex-1 h-10 rounded-lg border border-[#E8E8E8] text-sm text-[#666]"
                onClick={() => setConfirmTarget(null)}
              >
                取消
              </button>
              <button
                className="flex-1 h-10 rounded-lg bg-[#2D5016] text-white text-sm"
                onClick={() => void promoteToAdmin(confirmTarget)}
              >
                确认设为管理员
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
