import { useState, useRef, useCallback, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Play, Pause, Search, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useApp } from '../App'
import { MantouTitlePeek } from '../components/MantouFrog'

interface WaveformBarsProps {
  isPlaying: boolean
  compact?: boolean
}

function FeedImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const slides = images.length > 0 ? images : ['/images/bg_xuanzhi.jpg']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slides.join('|')])

  if (slides.length <= 1) {
    return (
      <img
        src={slides[0]}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIndex(i => (i <= 0 ? slides.length - 1 : i - 1))
  }

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIndex(i => (i >= slides.length - 1 ? 0 : i + 1))
  }

  return (
    <>
      <img
        src={slides[index]}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
      />

      <button
        type="button"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center active:scale-90"
        onClick={goPrev}
        aria-label="上一张"
      >
        <ChevronLeft size={22} className="text-white" />
      </button>

      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center active:scale-90"
        onClick={goNext}
        aria-label="下一张"
      >
        <ChevronRight size={22} className="text-white" />
      </button>

      <div className="absolute top-14 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/45'
            }`}
          />
        ))}
      </div>

      <div className="absolute top-14 right-4 z-20 px-2.5 py-0.5 rounded-full bg-black/35 text-white text-[11px] pointer-events-none backdrop-blur-sm">
        {index + 1} / {slides.length}
      </div>
    </>
  )
}

function WaveformBars({ isPlaying, compact }: WaveformBarsProps) {
  const bars = compact ? 16 : 24
  return (
    <div className="flex items-center gap-[2px] h-6">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-[2px] bg-white rounded-full transition-all ${isPlaying ? 'waveform-bar' : ''}`}
          style={{
            height: isPlaying ? undefined : '4px',
            animationDelay: isPlaying ? `${i * 0.05}s` : undefined,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  )
}

export default function HomeFeed() {
  const { state, togglePostLike, togglePostBookmark, selectPost, navigate, refreshPosts } = useApp()
  const [activeTab, setActiveTab] = useState<'recommend' | 'follow'>('recommend')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState<string | null>(null)
  const [heartAnimations, setHeartAnimations] = useState<{ id: number; postId: string }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartIdRef = useRef(0)

  const handleDoubleTap = useCallback((postId: string) => {
    togglePostLike(postId)
    const id = ++heartIdRef.current
    setHeartAnimations(prev => [...prev, { id, postId }])
    setTimeout(() => {
      setHeartAnimations(prev => prev.filter(a => a.id !== id))
    }, 800)
  }, [togglePostLike])

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      setPlayingId(null)
      setShowTranslation(null)
    }, 150)
  }, [])

  useEffect(() => {
    void refreshPosts()
  }, [refreshPosts])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  const posts = activeTab === 'recommend' ? state.posts : state.posts.filter((_, i) => i % 2 === 0)

  return (
    <div className="h-full flex flex-col relative">
      {/* Top overlay nav */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-4">
          {/* 乡音 title with Mantou frog peek effect */}
          <MantouTitlePeek />
          <div className="w-px h-4 bg-white/30" />
          <button
            className={`text-[15px] font-semibold transition-colors ${activeTab === 'follow' ? 'text-white' : 'text-white/60'}`}
            onClick={() => setActiveTab('follow')}
          >
            关注
          </button>
          <button
            className={`text-[15px] font-semibold transition-colors ${activeTab === 'recommend' ? 'text-white' : 'text-white/60'}`}
            onClick={() => setActiveTab('recommend')}
          >
            推荐
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-transform active:scale-90"
            onClick={() => navigate('splash')}
          >
            <RotateCcw size={16} strokeWidth={2} className="text-white" />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-transform active:scale-90"
            onClick={() => navigate('searchPage')}
          >
            <Search size={18} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>

      {/* Scrollable card container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative w-full h-full snap-start snap-al shrink-0 overflow-hidden"
            style={{ height: '100%' }}
            onDoubleClick={() => handleDoubleTap(post.id)}
          >
            {/* Background image(s) */}
            <FeedImageCarousel
              images={post.images?.length ? post.images : [post.image]}
              alt={post.region}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

            {/* Heart animation */}
            {heartAnimations.filter(a => a.postId === post.id).map(a => (
              <div
                key={a.id}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                style={{ animation: 'float-up 0.8s ease-out forwards' }}
              >
                <Heart size={80} strokeWidth={0} className="text-white fill-white/90" />
              </div>
            ))}

            {/* Bottom left: author info & text */}
            <div className="absolute bottom-20 left-4 right-20 z-10">
              <div className="flex items-center gap-2 mb-2">
                <img src={post.avatar} alt={post.author} className="w-8 h-8 rounded-full border border-white/40 object-cover" />
                <span className="text-white text-sm font-medium">{post.author}</span>
                <span className="text-white/60 text-xs flex items-center gap-0.5">
                  <MapPin size={10} />{post.region}
                </span>
              </div>
              <p className="text-white text-[15px] leading-relaxed mb-2 drop-shadow-lg">
                {post.dialect}
              </p>
              {showTranslation === post.id && (
                <div className="animate-fade-in">
                  <p className="text-white/80 text-xs leading-relaxed bg-black/30 rounded-lg px-3 py-2 backdrop-blur-sm">
                    {post.translation}
                  </p>
                </div>
              )}
              <button
                className="text-white/70 text-xs mt-1 flex items-center gap-1"
                onClick={() => setShowTranslation(showTranslation === post.id ? null : post.id)}
              >
                {showTranslation === post.id ? '收起翻译' : '查看翻译'}
                <ChevronLeft size={10} className={`transition-transform ${showTranslation === post.id ? '-rotate-90' : 'rotate-180'}`} />
              </button>
            </div>

            {/* Bottom right: action buttons */}
            <div className="absolute bottom-20 right-3 z-10 flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative mb-1">
                <img src={post.avatar} alt="" className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#E67E22] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] leading-none">+</span>
                </div>
              </div>
              {/* Like */}
              <button
                className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
                onClick={() => togglePostLike(post.id)}
              >
                <Heart
                  size={28}
                  strokeWidth={1.5}
                  className={post.liked ? 'text-[#E67E22] fill-[#E67E22]' : 'text-white'}
                />
                <span className="text-white text-[11px] drop-shadow">{post.likes}</span>
              </button>
              {/* Comment */}
              <button
                className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
                onClick={() => selectPost(post.id)}
              >
                <MessageCircle size={26} strokeWidth={1.5} className="text-white" />
                <span className="text-white text-[11px] drop-shadow">{post.comments}</span>
              </button>
              {/* Bookmark */}
              <button
                className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
                onClick={() => togglePostBookmark(post.id)}
              >
                <Bookmark
                  size={24}
                  strokeWidth={1.5}
                  className={post.bookmarked ? 'text-[#E67E22] fill-[#E67E22]' : 'text-white'}
                />
              </button>
              {/* Share */}
              <button className="flex flex-col items-center gap-0.5 transition-transform active:scale-90">
                <Share2 size={24} strokeWidth={1.5} className="text-white" />
                <span className="text-white text-[11px] drop-shadow">{post.shares}</span>
              </button>
            </div>

            {/* Audio waveform at bottom */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <button
                className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 transition-transform active:scale-95"
                onClick={() => setPlayingId(playingId === post.id ? null : post.id)}
              >
                {playingId === post.id ? (
                  <Pause size={14} className="text-white" />
                ) : (
                  <Play size={14} className="text-white ml-0.5" />
                )}
                <WaveformBars isPlaying={playingId === post.id} compact />
                <span className="text-white/80 text-[11px] ml-1">{post.duration}s</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
