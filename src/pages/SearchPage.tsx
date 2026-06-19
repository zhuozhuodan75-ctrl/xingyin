import { useState, useMemo } from 'react'
import { ChevronLeft, Search, UserPlus, UserCheck, Users } from 'lucide-react'
import { useApp } from '../App'

export default function SearchPage() {
  const { state, goBack, toggleFollow } = useApp()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return state.searchUsers
    const q = query.toLowerCase()
    return state.searchUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    )
  }, [query, state.searchUsers])

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90 shrink-0"
            onClick={goBack}
          >
            <ChevronLeft size={20} className="text-[#3E3E3E]" />
          </button>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
            <input
              type="text"
              placeholder="搜索用户姓名或ID..."
              className="w-full h-10 bg-white rounded-full pl-9 pr-4 text-sm outline-none border border-[#E0D8C8] focus:border-[#2D5016] transition-colors"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] text-xs"
                onClick={() => setQuery('')}
              >
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {query.trim() && (
          <p className="text-xs text-[#9E9E9E] mb-3">找到 {filtered.length} 个结果</p>
        )}

        <div className="space-y-2">
          {filtered.map(user => {
            const isFollowing = state.followingIds.has(user.id)
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl card-shadow p-3 flex items-center gap-3"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {/* Follow button under avatar */}
                  <button
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-white transition-all ${
                      isFollowing
                        ? 'bg-[#2D5016]'
                        : 'bg-[#E67E22]'
                    }`}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {isFollowing ? (
                      <UserCheck size={10} className="text-white" />
                    ) : (
                      <UserPlus size={10} className="text-white" />
                    )}
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#3E3E3E]">{user.name}</h3>
                    <span className="text-[10px] text-[#9E9E9E]">{user.handle}</span>
                  </div>
                  <p className="text-[11px] text-[#9E9E9E] mt-0.5 line-clamp-1">{user.bio}</p>
                  <div className="flex items-center gap-1 mt-1 text-[#9E9E9E]">
                    <Users size={10} />
                    <span className="text-[10px]">{user.followers} 粉丝</span>
                  </div>
                </div>

                <button
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    isFollowing
                      ? 'bg-[#2D5016]/10 text-[#2D5016]'
                      : 'bg-[#2D5016] text-white'
                  }`}
                  onClick={() => toggleFollow(user.id)}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && query.trim() && (
          <div className="flex flex-col items-center justify-center py-20 text-[#9E9E9E]">
            <Search size={48} strokeWidth={1} className="mb-3 opacity-40" />
            <p className="text-sm">未找到相关用户</p>
            <p className="text-[11px] mt-1">试试搜索其他关键词</p>
          </div>
        )}
      </div>
    </div>
  )
}
