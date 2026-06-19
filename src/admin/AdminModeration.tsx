import { useEffect, useState } from 'react'
import { Check, X, Play, Volume2, Image as ImageIcon, Inbox } from 'lucide-react'
import { fetchModerationPosts, updatePostStatus, type AdminPostRow } from '@/lib/adminApi'
import { AdminPageHeader, AdminEmptyState, AdminCard } from './AdminPageHeader'

type Tab = 'pending' | 'published' | 'rejected'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function MediaBadge({ post }: { post: AdminPostRow }) {
  if (post.video_url) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] bg-[#2980B9]/10 text-[#2980B9] px-2.5 py-0.5 rounded-full font-medium">
        <Play size={11} /> 视频
      </span>
    )
  }
  if (post.audio_url) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] bg-[#E67E22]/10 text-[#E67E22] px-2.5 py-0.5 rounded-full font-medium">
        <Volume2 size={11} /> 音频
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-[#9E9E9E]/10 text-[#777] px-2.5 py-0.5 rounded-full font-medium">
      <ImageIcon size={11} /> 图文
    </span>
  )
}

export default function AdminModeration() {
  const [tab, setTab] = useState<Tab>('pending')
  const [posts, setPosts] = useState<AdminPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    void fetchModerationPosts(tab)
      .then(setPosts)
      .catch(err => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [tab])

  const handleReview = async (postId: string, status: 'published' | 'rejected') => {
    setActing(postId)
    try {
      await updatePostStatus(postId, status)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActing(null)
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending', label: '待审核' },
    { key: 'published', label: '已通过' },
    { key: 'rejected', label: '已拒绝' },
  ]

  const emptyMessages: Record<Tab, { title: string; desc: string }> = {
    pending: { title: '暂无待审核内容', desc: '用户提交作品后将显示在这里' },
    published: { title: '暂无已通过内容', desc: '审核通过的作品会归档在此' },
    rejected: { title: '暂无已拒绝内容', desc: '被拒绝的作品会显示在这里' },
  }

  return (
    <div>
      <AdminPageHeader
        title="内容审核"
        description="审核用户上传的音频、视频与方言作品"
      />

      <div className="inline-flex p-1 bg-white rounded-xl border border-[#E8EBEF] shadow-sm mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
              tab === t.key
                ? 'bg-[#2D5016] text-white shadow-sm'
                : 'text-[#666] hover:text-[#333] hover:bg-[#F5F7FA]'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#2D5016] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#aaa] mt-3">加载中...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-[#8B2635]">{error}</div>
        ) : posts.length === 0 ? (
          <AdminEmptyState
            icon={Inbox}
            title={emptyMessages[tab].title}
            description={emptyMessages[tab].desc}
          />
        ) : (
          <div className="divide-y divide-[#F0F2F5]">
            {posts.map(post => (
              <div key={post.id} className="p-5 flex flex-col lg:flex-row gap-5 hover:bg-[#FAFBFC] transition-colors">
                <div className="w-full lg:w-36 h-28 rounded-xl overflow-hidden bg-[#F5F7FA] shrink-0 ring-1 ring-[#E8EBEF]">
                  {post.cover_url ? (
                    <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ccc]">
                      <ImageIcon size={28} strokeWidth={1.25} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[15px] font-semibold text-[#333]">{post.author_name}</span>
                    <span className="text-xs text-[#aaa]">@{post.author_handle}</span>
                    <MediaBadge post={post} />
                    <span className="text-xs text-[#888] bg-[#F5F7FA] px-2 py-0.5 rounded-md">{post.region}</span>
                  </div>
                  <p className="text-[14px] text-[#444] leading-relaxed line-clamp-2">{post.dialect_text}</p>
                  <p className="text-xs text-[#aaa] mt-2">{formatDate(post.created_at)}</p>

                  {(post.audio_url || post.video_url) && (
                    <div className="mt-3 p-3 bg-[#F9FAFB] rounded-xl">
                      {post.audio_url && (
                        <audio controls src={post.audio_url} className="h-9 w-full max-w-md" />
                      )}
                      {post.video_url && (
                        <video controls src={post.video_url} className="mt-2 max-h-44 rounded-lg max-w-md w-full" />
                      )}
                    </div>
                  )}
                </div>

                {tab === 'pending' && (
                  <div className="flex lg:flex-col gap-2 shrink-0 lg:pt-1">
                    <button
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#2D5016] hover:bg-[#244012] text-white rounded-xl text-[14px] font-medium disabled:opacity-60 transition-colors shadow-sm"
                      disabled={acting === post.id}
                      onClick={() => void handleReview(post.id, 'published')}
                    >
                      <Check size={16} /> 通过
                    </button>
                    <button
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-[#8B2635]/30 text-[#8B2635] hover:bg-[#8B2635]/5 rounded-xl text-[14px] font-medium disabled:opacity-60 transition-colors"
                      disabled={acting === post.id}
                      onClick={() => void handleReview(post.id, 'rejected')}
                    >
                      <X size={16} /> 拒绝
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  )
}
