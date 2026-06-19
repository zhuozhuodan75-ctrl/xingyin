import { useEffect, useState } from 'react'
import { ChevronLeft, Play, Pause, Heart, MessageCircle, Eye, Clock, Grid3X3 } from 'lucide-react'
import { useApp } from '../App'
import { fetchMyPosts, type MyWorkItem } from '@/lib/posts'

const statusLabel: Record<string, string> = {
  pending: '待审核',
  published: '已发布',
  rejected: '未通过',
  hidden: '已隐藏',
  draft: '草稿',
}

export default function MyWorks() {
  const { goBack, state } = useApp()
  const [activeFilter, setActiveFilter] = useState<'all' | 'published'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [works, setWorks] = useState<MyWorkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state.userId) {
      setWorks([])
      setLoading(false)
      return
    }
    setLoading(true)
    void fetchMyPosts(state.userId).then(items => {
      setWorks(items)
      setLoading(false)
    })
  }, [state.userId])

  const filtered =
    activeFilter === 'published'
      ? works.filter(w => w.status === 'published')
      : works

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 bg-[#F5F1E8]">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">我的作品</h1>
        <span className="text-xs text-[#9E9E9E] ml-auto">{works.length} 个</span>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex gap-2 px-4 pb-2">
        <button
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === 'all' ? 'bg-[#2D5016] text-white' : 'bg-white text-[#9E9E9E] card-shadow'}`}
          onClick={() => setActiveFilter('all')}
        >
          全部
        </button>
        <button
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === 'published' ? 'bg-[#2D5016] text-white' : 'bg-white text-[#9E9E9E] card-shadow'}`}
          onClick={() => setActiveFilter('published')}
        >
          已发布
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {loading ? (
          <p className="text-center text-sm text-[#9E9E9E] py-12">加载中…</p>
        ) : !state.userId ? (
          <p className="text-center text-sm text-[#9E9E9E] py-12">登录后可查看云端作品</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-[#9E9E9E] py-12">
            {activeFilter === 'published' ? '暂无已发布作品' : '还没有作品，去创作页提交吧'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const isExpanded = expandedId === item.id
              const isPlaying = playingId === item.id
              const isLiked = likedIds.has(item.id)
              return (
                <div key={item.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
                  <button
                    className="w-full flex gap-3 p-3 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-black/50 rounded px-1">
                        <span className="text-white text-[9px]">{item.duration}s</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-[#8B2635] font-medium">{item.region}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          item.status === 'published'
                            ? 'bg-[#2D5016]/10 text-[#2D5016]'
                            : item.status === 'pending'
                            ? 'bg-[#E67E22]/10 text-[#E67E22]'
                            : 'bg-[#9E9E9E]/10 text-[#9E9E9E]'
                        }`}>
                          {statusLabel[item.status] ?? item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#3E3E3E] line-clamp-2 leading-relaxed">{item.phrase}</p>
                      <p className="text-[10px] text-[#9E9E9E] mt-1">{item.date}</p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 flex items-center justify-between border-t border-[#F5F1E8] pt-2">
                      <div className="flex items-center gap-3 text-[#9E9E9E]">
                        <span className="flex items-center gap-1 text-[10px]"><Eye size={12} /> —</span>
                        <span className="flex items-center gap-1 text-[10px]"><Heart size={12} /> {item.likes}</span>
                        <span className="flex items-center gap-1 text-[10px]"><Clock size={12} /> {item.duration}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center"
                          onClick={() => setPlayingId(isPlaying ? null : item.id)}
                        >
                          {isPlaying ? <Pause size={14} className="text-[#2D5016]" /> : <Play size={14} className="text-[#2D5016]" />}
                        </button>
                        <button
                          className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center"
                          onClick={() => toggleLike(item.id)}
                        >
                          <Heart size={14} className={isLiked ? 'text-[#8B2635] fill-[#8B2635]' : 'text-[#9E9E9E]'} />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center">
                          <MessageCircle size={14} className="text-[#9E9E9E]" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center">
                          <Grid3X3 size={14} className="text-[#9E9E9E]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
