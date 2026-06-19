import { useState } from 'react'
import { ChevronLeft, BookOpen, Clock, Share2, Bookmark, Check } from 'lucide-react'
import { useApp } from '../App'

const wikiArticles = [
  { id: '1', title: '为什么四川话这么幽默？', category: '方言趣谈', color: '#2D5016', readTime: '3分钟', content: '四川话的幽默感源于其独特的声调系统和丰富的俚语。四川话有20个声母、36个韵母、4个声调，相比普通话更加抑扬顿挫。加之巴蜀文化特有的乐观精神，让四川话充满了生活气息和幽默元素。' },
  { id: '2', title: '粤语九声六调的奥秘', category: '语音知识', color: '#8B2635', readTime: '5分钟', content: '粤语保留了古汉语的九声六调系统，是研究古汉语语音的宝贵材料。平、上、去、入四声各分阴阳，再加上一个中平调，构成了粤语音韵的丰富层次。' },
  { id: '3', title: '东北话：最简单的方言', category: '方言入门', color: '#E67E22', readTime: '4分钟', content: '东北话接近普通话，是最容易听懂的方言之一。其特点是声调简化、儿化音多、词汇直白有力。从赵本山的小品到东北人的日常交流，东北话以其独特的感染力征服了全国。' },
  { id: '4', title: '上海话中的吴侬软语', category: '文化故事', color: '#2D5016', readTime: '6分钟', content: '上海话属于吴语太湖片苏沪嘉小片，继承了吴侬软语的柔美特质。连续的变调、细碎的语气词，让上海话听起来如同音乐般流畅。随着时代变迁，上海话正面临传承的挑战。' },
  { id: '5', title: '闽南语：古汉语的活化石', category: '历史溯源', color: '#8B2635', readTime: '7分钟', content: '闽南语保留了大量上古汉语和中古汉语的特征，被称为"古汉语的活化石"。其语音系统中有全浊声母、入声韵尾等古汉语特征，是语言学家研究汉语演变的珍贵材料。' },
]

export default function WikiDetail() {
  const { state, goBack } = useApp()
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [shared, setShared] = useState(false)

  const currentId = state.selectedWikiId
  const articles = currentId === 'all' ? wikiArticles : wikiArticles.filter(a => a.id === currentId)

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleShare = () => {
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90" onClick={goBack}>
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">方言小百科</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
              {/* Banner */}
              <div className="h-28 relative" style={{ background: article.color }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{article.category}</span>
                  <h2 className="text-base font-bold text-white mt-1 drop-shadow">{article.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-[#9E9E9E]">
                    <BookOpen size={12} />
                    <span className="text-[11px]">{article.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#9E9E9E]">
                    <Clock size={12} />
                    <span className="text-[11px]">{article.readTime}</span>
                  </div>
                </div>

                <p className="text-sm text-[#3E3E3E] leading-relaxed">{article.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#F5F1E8]">
                  <button className="flex items-center gap-1.5 text-[11px] text-[#9E9E9E] transition-colors" onClick={() => toggleBookmark(article.id)}>
                    <Bookmark size={14} className={bookmarked.has(article.id) ? 'text-[#E67E22] fill-[#E67E22]' : ''} />
                    {bookmarked.has(article.id) ? '已收藏' : '收藏'}
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] text-[#9E9E9E] transition-colors" onClick={handleShare}>
                    <Share2 size={14} />
                    分享
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More articles section */}
        {currentId !== 'all' && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#3E3E3E] mb-3">更多文章</h3>
            <div className="space-y-2">
              {wikiArticles.filter(a => a.id !== currentId).map(a => (
                <button key={a.id} className="w-full flex items-center gap-3 bg-white rounded-xl p-3 card-shadow text-left transition-transform active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}>
                    <BookOpen size={18} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3E3E3E] line-clamp-1">{a.title}</p>
                    <p className="text-[10px] text-[#9E9E9E]">{a.category} · {a.readTime}</p>
                  </div>
                  <ChevronLeft size={14} className="text-[#E0D8C8] rotate-180" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {shared && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 z-50 animate-scale-in flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#2D5016] flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
          <span className="text-white text-sm font-medium">已分享</span>
        </div>
      )}
    </div>
  )
}
