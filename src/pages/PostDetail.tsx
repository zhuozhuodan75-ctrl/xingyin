import { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, Send, ChevronLeft, MapPin, Play, Pause } from 'lucide-react'
import { useApp } from '../App'
import { createComment, fetchCommentsSafe, type CommentItem } from '@/lib/socialApi'

export default function PostDetail() {
  const { state, goBack, togglePostLike, togglePostBookmark, bumpPostCommentCount, isLoggedIn } = useApp()
  const [comment, setComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const post = state.posts.find(p => p.id === state.selectedPostId)

  const loadComments = useCallback(async () => {
    if (!post) return
    const rows = await fetchCommentsSafe(post.id)
    setComments(rows)
  }, [post])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const handleSubmitComment = async () => {
    if (!post || !comment.trim()) return
    if (!isLoggedIn) {
      showToast('请先登录')
      return
    }
    setSubmitting(true)
    const result = await createComment(post.id, comment)
    setSubmitting(false)
    if (!result.ok) {
      showToast(result.message ?? '评论失败')
      return
    }
    setComment('')
    bumpPostCommentCount(post.id)
    await loadComments()
  }

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="theme-text-muted">作品不存在</p>
      </div>
    )
  }

  const images = post.images?.length ? post.images : [post.image]

  return (
    <div className="h-full flex flex-col theme-bg relative">
      {toast && (
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#2D5016] text-white text-xs px-4 py-2 rounded-full shadow-lg">{toast}</div>
        </div>
      )}

      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 theme-bg">
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-full theme-surface card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="theme-text" />
        </button>
        <div className="flex items-center gap-2">
          <img src={post.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          <span className="text-sm font-medium theme-text">{post.author}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="relative mx-4 rounded-2xl overflow-hidden card-shadow" style={{ aspectRatio: '16/10' }}>
          <img src={images[0]} alt="" className="w-full h-full object-cover" />
          {images.length > 1 && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/45 text-white text-[10px]">
              {images.length} 张
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-white/80" />
              <span className="text-white/90 text-xs">{post.region}</span>
            </div>
            <p className="text-white text-sm font-medium drop-shadow-lg">{post.dialect}</p>
          </div>
        </div>

        <div className="mx-4 mt-3 theme-surface rounded-2xl card-shadow p-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#2D5016] flex items-center justify-center transition-transform active:scale-90"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause size={16} className="text-white" />
              ) : (
                <Play size={16} className="text-white ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-[2px] h-5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-[#2D5016]/60 rounded-full"
                    style={{
                      height: isPlaying ? `${8 + Math.sin(i * 0.4) * 8}px` : '4px',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] theme-text-muted">0:00</span>
                <span className="text-[10px] theme-text-muted">{post.duration}s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-3 theme-surface rounded-2xl card-shadow p-3">
          <p className="text-xs theme-text-muted mb-1">普通话翻译</p>
          <p className="text-sm theme-text">{post.translation}</p>
        </div>

        <div className="mx-4 mt-3 flex items-center justify-around theme-surface rounded-2xl card-shadow py-3">
          <button
            type="button"
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
            onClick={() => togglePostLike(post.id)}
          >
            <Heart size={22} strokeWidth={1.5} className={post.liked ? 'text-[#8B2635] fill-[#8B2635]' : 'theme-text'} />
            <span className="text-[10px] theme-text-muted">{post.likes}</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <MessageCircle size={22} strokeWidth={1.5} className="theme-text" />
            <span className="text-[10px] theme-text-muted">{post.comments}</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
            onClick={() => togglePostBookmark(post.id)}
          >
            <Bookmark size={22} strokeWidth={1.5} className={post.bookmarked ? 'text-[#E67E22] fill-[#E67E22]' : 'theme-text'} />
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <Share2 size={22} strokeWidth={1.5} className="theme-text" />
            <span className="text-[10px] theme-text-muted">{post.shares}</span>
          </button>
        </div>

        <div className="px-4 mt-4 mb-4">
          <h3 className="text-sm font-semibold theme-text mb-3">评论 ({post.comments})</h3>
          <div className="space-y-2">
            {comments.length === 0 ? (
              <p className="text-xs theme-text-muted text-center py-4">还没有评论，来抢沙发吧</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex items-start gap-3 theme-surface rounded-xl p-3 card-shadow">
                  <img src={c.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 self-start" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium theme-text">{c.author}</span>
                      <span className="text-[10px] theme-text-muted">{c.time}</span>
                    </div>
                    <p className="text-xs theme-text-soft mt-1">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 px-4 py-2 theme-surface border-t theme-border">
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="写下你的评论..."
          className="flex-1 h-10 theme-muted rounded-full px-4 text-sm outline-none theme-text"
          onKeyDown={e => {
            if (e.key === 'Enter') void handleSubmitComment()
          }}
        />
        <button
          type="button"
          disabled={submitting || !comment.trim()}
          className="w-10 h-10 rounded-full bg-[#2D5016] flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
          onClick={() => void handleSubmitComment()}
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
