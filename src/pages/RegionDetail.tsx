import { useState } from 'react'
import { ChevronLeft, MapPin, Play, Pause, Heart, MessageCircle, Share2, Bookmark, Star, Trophy } from 'lucide-react'
import { useApp } from '../App'
import { allRegions } from '../data/regions'

export default function RegionDetail() {
  const { state, goBack, navigate } = useApp()
  const [activeTab, setActiveTab] = useState<'videos' | 'game'>('videos')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [checkinDone] = useState(false)

  const regionName = state.selectedRegionName || '四川'
  const regionData = allRegions.find(r => r.short === regionName) || allRegions[0]
  const posts = state.regionPosts.length > 0 ? state.regionPosts : [
    { id: 'r1', author: '方言达人', avatar: '/images/avatar2.jpg', region: `${regionName}·${regionData.city}`, dialect: regionData.phrase, translation: '点击播放收听方言发音', image: '/images/cover_sichuan.jpg', likes: 128, duration: 8 },
  ]

  const handleLike = (id: string) => {
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
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90" onClick={goBack}>
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[15px] font-semibold text-[#3E3E3E]">{regionData.full}</h1>
          <p className="text-[10px] text-[#9E9E9E] flex items-center gap-1"><MapPin size={9} /> {regionData.city}</p>
        </div>
      </div>

      {/* Region banner */}
      <div className="shrink-0 mx-4 mb-3 relative rounded-2xl overflow-hidden card-shadow" style={{ height: 100 }}>
        <img src={`/images/cover_${regionName === '黑龙江' ? 'dongbei' : regionName === '四川' ? 'sichuan' : regionName === '上海' ? 'shanghai' : regionName === '广东' ? 'guangdong' : regionName === '湖南' ? 'hunan' : 'sichuan'}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <div>
            <span className="text-white text-base font-bold drop-shadow">{regionData.short}方言</span>
            <span className="text-white/70 text-xs ml-2">{regionData.count}</span>
          </div>
          {checkinDone && (
            <div className="bg-[#2D5016]/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
              <Star size={10} className="text-[#E67E22] fill-[#E67E22]" />
              <span className="text-white text-[10px]">已打卡</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex mx-4 mb-3 bg-white rounded-full p-0.5 card-shadow">
        <button className={`flex-1 py-1.5 text-xs rounded-full font-medium transition-all ${activeTab === 'videos' ? 'bg-[#2D5016] text-white' : 'text-[#9E9E9E]'}`} onClick={() => setActiveTab('videos')}>方言视频</button>
        <button className={`flex-1 py-1.5 text-xs rounded-full font-medium transition-all ${activeTab === 'game' ? 'bg-[#E67E22] text-white' : 'text-[#9E9E9E]'}`} onClick={() => navigate('gameScreen')}>
          <span className="flex items-center justify-center gap-1">
            <Trophy size={12} /> 方言闯关
          </span>
        </button>
      </div>

      {/* Content - Videos only */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="space-y-3">
          {posts.map(post => {
            const isPlaying = playingId === post.id
            const isLiked = likedIds.has(post.id)
            return (
              <div key={post.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
                <div className="relative" style={{ aspectRatio: '16/10' }}>
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button className="absolute inset-0 flex items-center justify-center" onClick={() => setPlayingId(isPlaying ? null : post.id)}>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
                    </div>
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/40 rounded-full px-2 py-0.5 text-white text-[10px]">{post.duration}s</span>
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <img src={post.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-white text-[10px] drop-shadow">{post.author}</span>
                  </div>
                  {isPlaying && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-end gap-[2px] h-6">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-white/70 rounded-full" style={{ height: `${Math.max(20, Math.sin(i * 0.5) * 40 + 40)}%`, animation: `waveform 1s ease-in-out infinite ${i * 0.05}s` }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm text-[#3E3E3E] font-medium">{post.dialect}</p>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">{post.translation}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-[11px] text-[#9E9E9E]" onClick={() => handleLike(post.id)}>
                        <Heart size={14} className={isLiked ? 'text-[#8B2635] fill-[#8B2635]' : ''} /> {post.likes + (isLiked ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-1 text-[11px] text-[#9E9E9E]"><MessageCircle size={14} /> 12</span>
                      <span className="flex items-center gap-1 text-[11px] text-[#9E9E9E]"><Share2 size={14} /> 分享</span>
                    </div>
                    <Bookmark size={14} className="text-[#9E9E9E]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
