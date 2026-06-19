import { useState } from 'react'
import { ChevronLeft, Heart, Play, Pause, Trash2, FolderHeart } from 'lucide-react'
import { useApp } from '../App'

const favoriteItems = [
  { id: 'f1', type: 'post', author: '老成都茶馆', avatar: '/images/avatar2.jpg', region: '四川·成都', dialect: '巴适得板！今儿个太阳好，来碗盖碗茶嘛。', image: '/images/cover_sichuan.jpg', likes: 328, duration: 12 },
  { id: 'f2', type: 'post', author: '东北老铁', avatar: '/images/avatar2.jpg', region: '黑龙江·哈尔滨', dialect: '哎呀妈呀，这天儿贼拉冷，整点饺子暖和暖和！', image: '/images/cover_dongbei.jpg', likes: 512, duration: 11 },
  { id: 'f3', type: 'card', region: '四川', city: '成都', phrase: '巴适得板', image: '/images/card_template1.jpg' },
  { id: 'f4', type: 'card', region: '上海', city: '黄浦', phrase: '侬好呀', image: '/images/card_template2.jpg' },
  { id: 'f5', type: 'post', author: '湘西阿妹', avatar: '/images/avatar1.jpg', region: '湖南·凤凰', dialect: '咯里的山水美得很，你来得正是时候。', image: '/images/cover_hunan.jpg', likes: 445, duration: 10 },
]

type FilterTab = 'all' | 'posts' | 'cards'

export default function Favorites() {
  const { goBack } = useApp()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [items, setItems] = useState(favoriteItems)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
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
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">我的收藏</h1>
        <span className="text-xs text-[#9E9E9E] ml-auto">{items.length} 项</span>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex gap-2 px-4 pb-2">
        {([
          { key: 'all', label: '全部' },
          { key: 'posts', label: '乡音视频' },
          { key: 'cards', label: '宝藏卡' },
        ] as { key: FilterTab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            className={`px-3 py-1.5 rounded-full text-xs transition-all ${filter === tab.key ? 'bg-[#2D5016] text-white' : 'bg-white text-[#9E9E9E] card-shadow'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Favorites list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
              {item.type === 'post' ? (
                <>
                  <div className="relative" style={{ aspectRatio: '16/9' }}>
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                    >
                      {playingId === item.id ? (
                        <Pause size={14} className="text-white" />
                      ) : (
                        <Play size={14} className="text-white ml-0.5" />
                      )}
                    </button>
                    <span className="absolute bottom-2 right-2 text-white/80 text-[10px]">{item.duration}s</span>
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <img src={item.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-white text-[10px] drop-shadow">{item.author}</span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#3E3E3E] line-clamp-1">{item.dialect}</p>
                      <p className="text-[10px] text-[#9E9E9E] mt-0.5">{item.region}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-[#9E9E9E]">
                        <Heart size={12} className="text-[#8B2635]" /> {item.likes}
                      </span>
                      <button
                        className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center transition-transform active:scale-90"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={14} className="text-[#9E9E9E]" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 card-shadow">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-[#2D5016] bg-[#2D5016]/10 px-2 py-0.5 rounded-full">宝藏卡</span>
                    <p className="text-sm font-medium text-[#3E3E3E] mt-1">「{item.phrase}」</p>
                    <p className="text-[11px] text-[#9E9E9E]">{item.region}·{item.city}</p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center transition-transform active:scale-90 shrink-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 size={14} className="text-[#9E9E9E]" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#9E9E9E]">
            <FolderHeart size={48} strokeWidth={1} className="mb-3 opacity-40" />
            <p className="text-sm">暂无收藏</p>
            <p className="text-[11px] mt-1">浏览乡音视频时点爱心收藏</p>
          </div>
        )}
      </div>
    </div>
  )
}
