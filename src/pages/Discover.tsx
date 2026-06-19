import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, ChevronRight, Play, Volume2, BookOpen, X, MapPin, Sparkles } from 'lucide-react'
import { useApp } from '../App'
import { allRegions, sampleAudioClips, provinceColorMap, provinceLandmarkMap, provincePositionMap } from '../data/regions'

const wikiItems = [
  { id: '1', title: '为什么四川话这么幽默？', category: '方言趣谈', readTime: '3分钟', color: '#2D5016', content: '四川话的幽默感源于其独特的声调系统和丰富的俚语。四川话有20个声母、36个韵母、4个声调，相比普通话更加抑扬顿挫。加之巴蜀文化特有的乐观精神，让四川话充满了生活气息和幽默元素。' },
  { id: '2', title: '粤语九声六调的奥秘', category: '语音知识', readTime: '5分钟', color: '#8B2635', content: '粤语保留了古汉语的九声六调系统，是研究古汉语语音的宝贵材料。平、上、去、入四声各分阴阳，再加上一个中平调，构成了粤语音韵的丰富层次。' },
  { id: '3', title: '东北话：最简单的方言', category: '方言入门', readTime: '4分钟', color: '#E67E22', content: '东北话接近普通话，是最容易听懂的方言之一。其特点是声调简化、儿化音多、词汇直白有力。从赵本山的小品到东北人的日常交流，东北话以其独特的感染力征服了全国。' },
  { id: '4', title: '上海话中的吴侬软语', category: '文化故事', readTime: '6分钟', color: '#2D5016', content: '上海话属于吴语太湖片苏沪嘉小片，继承了吴侬软语的柔美特质。连续的变调、细碎的语气词，让上海话听起来如同音乐般流畅。随着时代变迁，上海话正面临传承的挑战。' },
  { id: '5', title: '闽南语：古汉语的活化石', category: '历史溯源', readTime: '7分钟', color: '#8B2635', content: '闽南语保留了大量上古汉语和中古汉语的特征，被称为"古汉语的活化石"。其语音系统中有全浊声母、入声韵尾等古汉语特征，是语言学家研究汉语演变的珍贵材料。' },
]

function CloudSVG({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 40" fill="white" opacity="0.7">
      <ellipse cx="25" cy="25" rx="18" ry="12" />
      <ellipse cx="45" cy="20" rx="22" ry="14" />
      <ellipse cx="65" cy="24" rx="18" ry="12" />
      <ellipse cx="40" cy="28" rx="28" ry="10" />
    </svg>
  )
}

function CompassSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="28" stroke="#C4A97D" strokeWidth="1.5" fill="#F5F0E6" opacity="0.8" />
      <circle cx="30" cy="30" r="22" stroke="#C4A97D" strokeWidth="0.8" opacity="0.5" />
      <text x="30" y="10" textAnchor="middle" fill="#8B2635" fontSize="9" fontWeight="bold">N</text>
      <text x="30" y="54" textAnchor="middle" fill="#3E3E3E" fontSize="7">S</text>
      <text x="8" y="33" textAnchor="middle" fill="#3E3E3E" fontSize="7">W</text>
      <text x="52" y="33" textAnchor="middle" fill="#3E3E3E" fontSize="7">E</text>
      <polygon points="30,6 33,30 30,28 27,30" fill="#8B2635" opacity="0.8" />
      <polygon points="30,54 33,30 30,32 27,30" fill="#C4A97D" opacity="0.6" />
      <circle cx="30" cy="30" r="3" fill="#C4A97D" />
    </svg>
  )
}

function SouthChinaSeaSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 80" fill="none">
      <rect x="1" y="1" width="118" height="78" rx="8" fill="#E8F0F5" stroke="#B8C8D8" strokeWidth="1" strokeDasharray="3,2" opacity="0.8" />
      <text x="60" y="18" textAnchor="middle" fill="#5A7A8A" fontSize="9" fontWeight="bold">南海诸岛</text>
      <circle cx="35" cy="40" r="3" fill="#C8D8B8" stroke="#9E9688" strokeWidth="0.5" />
      <circle cx="50" cy="35" r="2.5" fill="#C8D8B8" stroke="#9E9688" strokeWidth="0.5" />
      <circle cx="55" cy="45" r="2" fill="#C8D8B8" stroke="#9E9688" strokeWidth="0.5" />
      <circle cx="65" cy="38" r="2.5" fill="#C8D8B8" stroke="#9E9688" strokeWidth="0.5" />
      <circle cx="75" cy="42" r="2" fill="#C8D8B8" stroke="#9E9688" strokeWidth="0.5" />
      <circle cx="85" cy="50" r="3" fill="#F0C8C0" stroke="#9E9688" strokeWidth="0.5" />
      <text x="85" y="62" textAnchor="middle" fill="#9E9688" fontSize="6">台湾</text>
      <circle cx="25" cy="55" r="1" fill="#B8C8D8" opacity="0.5" />
      <circle cx="40" cy="60" r="0.8" fill="#B8C8D8" opacity="0.5" />
      <circle cx="95" cy="35" r="0.8" fill="#B8C8D8" opacity="0.5" />
    </svg>
  )
}

export default function Discover() {
  const { navigate, selectRegion, selectWiki } = useApp()
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [svgContent, setSvgContent] = useState<string>('')
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const mapWrapRef = useRef<HTMLDivElement>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/china_map.svg')
      .then(r => r.text())
      .then(text => {
        // Pre-process SVG: replace all gray fills with transparent, apply province colors
        let processed = text
        // Remove background rects (the two gray bg layers)
        processed = processed.replace(/<rect[^>]*fill="#[Ee][0-9a-fA-F]{5}"[^>]*\/?>/g, '')
        processed = processed.replace(/<rect[^>]*fill="#[Dd]4[Cc][Dd][Bb][Ff]"[^>]*\/?>/g, '')
        // Replace all province-path default gray fills with province-specific colors
        // Note: fill="..." comes BEFORE data-short="..." in the SVG
        Object.entries(provinceColorMap).forEach(([name, color]) => {
          // Match: fill="#[hex]" ... data-short="name"
          const regex = new RegExp(`fill="#[^"]*"([^>]*?data-short="${name}"[^>]*?)`, 'g')
          processed = processed.replace(regex, `fill="${color}"$1`)
        })
        setSvgContent(processed)
      })
  }, [])

  const applyWatercolorStyles = useCallback(() => {
    if (!mapWrapRef.current || !svgContainerRef.current) return
    const svg = mapWrapRef.current.querySelector('svg')
    if (!svg) return

    // Make any remaining rects transparent
    svg.querySelectorAll('rect').forEach(r => {
      ;(r as SVGRectElement).style.fill = 'transparent'
    })

    // Add hover/click events to province paths
    const paths = svg.querySelectorAll('.province-path')
    paths.forEach(path => {
      const el = path as SVGPathElement
      const short = el.getAttribute('data-short') || ''
      const color = provinceColorMap[short]
      if (!color) return

      // Read current fill (already set by pre-processing)
      const originalFill = el.getAttribute('fill') || color

      el.style.transition = 'all 0.3s ease'
      el.style.cursor = 'pointer'
      el.style.opacity = '0.88'

      el.addEventListener('mouseenter', () => {
        if (selectedProvince !== short) {
          el.style.fill = '#8B2635'
          el.style.filter = 'drop-shadow(0 2px 4px rgba(139,38,53,0.3))'
          el.style.opacity = '1'
        }
      })
      el.addEventListener('mouseleave', () => {
        if (selectedProvince === short) {
          el.style.fill = '#2D5016'
          el.style.filter = 'drop-shadow(0 4px 8px rgba(45,80,22,0.4))'
        } else {
          el.style.fill = originalFill
          el.style.filter = 'none'
          el.style.opacity = '0.88'
        }
      })
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        if (isDragging) return
        const region = allRegions.find(r => r.short === short)
        if (region) {
          setSelectedProvince(short)
          setShowConfirm(true)
        }
      })
    })

    const defsEl = svg.querySelector('defs') || svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svg.firstChild)
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleEl.textContent = '.prov-label { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; text-anchor: middle; dominant-baseline: middle; pointer-events: none; user-select: none; }'
    defsEl.appendChild(styleEl)

    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    labelGroup.setAttribute('class', 'province-labels')
    labelGroup.setAttribute('style', 'pointer-events: none')
    svg.appendChild(labelGroup)

    Object.entries(provincePositionMap).forEach(([name, pos]) => {
      const landmark = provinceLandmarkMap[name] || ''
      const region = allRegions.find(r => r.short === name)
      if (!region) return

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      bg.setAttribute('x', String(pos.x - 20))
      bg.setAttribute('y', String(pos.y - 10))
      bg.setAttribute('width', '40')
      bg.setAttribute('height', '18')
      bg.setAttribute('rx', '9')
      bg.setAttribute('fill', 'rgba(255,255,255,0.75)')
      bg.setAttribute('stroke', 'rgba(255,255,255,0.9)')
      bg.setAttribute('stroke-width', '0.5')
      labelGroup.appendChild(bg)

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', String(pos.x))
      text.setAttribute('y', String(pos.y))
      text.setAttribute('class', 'prov-label')
      text.setAttribute('font-size', '8')
      text.setAttribute('fill', '#5A4A3A')
      text.textContent = name
      labelGroup.appendChild(text)

      if (landmark && (region.count || '').includes(',')) {
        const emojiText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        emojiText.setAttribute('x', String(pos.x))
        emojiText.setAttribute('y', String(pos.y + 16))
        emojiText.setAttribute('text-anchor', 'middle')
        emojiText.setAttribute('dominant-baseline', 'middle')
        emojiText.setAttribute('font-size', '11')
        emojiText.textContent = landmark
        labelGroup.appendChild(emojiText)
      }
    })
  }, [svgContent, selectedProvince, isDragging])

  useEffect(() => {
    if (svgContent) {
      setTimeout(applyWatercolorStyles, 100)
    }
  }, [svgContent, applyWatercolorStyles])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { ...pan }
    setIsDragging(false)
    const target = e.target as HTMLElement
    if (target.tagName === 'path') return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true)
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    setTimeout(() => setIsDragging(false), 50)
  }, [])

  // Wheel zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (!mapWrapRef.current) return

    const rect = mapWrapRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate zoom direction
    const delta = e.deltaY > 0 ? -0.15 : 0.15
    const newScale = Math.min(Math.max(scale + delta, 1), 8)

    if (newScale === scale) return

    // Zoom towards mouse pointer
    const scaleRatio = newScale / scale
    const newPanX = mouseX - (mouseX - pan.x) * scaleRatio
    const newPanY = mouseY - (mouseY - pan.y) * scaleRatio

    // Clamp pan to keep map visible
    const maxPan = Math.max(0, (newScale - 1) * 200)
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newPanX)),
      y: Math.max(-maxPan, Math.min(maxPan, newPanY)),
    })
    setScale(newScale)
  }, [scale, pan])

  const handleStartChallenge = () => {
    if (selectedProvince) {
      selectRegion(selectedProvince)
      setShowConfirm(false)
    }
  }

  const selectedRegionData = selectedProvince ? allRegions.find(r => r.short === selectedProvince) : null
  const selProvince = selectedProvince || ''

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#F5F1E8]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F5F1E8]/95 backdrop-blur-sm px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
            <input
              type="text"
              placeholder="搜索方言、地区、词汇..."
              className="w-full h-10 bg-white rounded-full pl-9 pr-4 text-sm outline-none border border-[#E0D8C8] focus:border-[#2D5016] transition-colors"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="w-10 h-10 rounded-full bg-white card-shadow flex items-center justify-center shrink-0 transition-transform active:scale-90"
            onClick={() => navigate('searchPage')}
          >
            <Search size={18} className="text-[#2D5016]" />
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#E67E22]" />
            <h2 className="text-lg font-semibold text-[#3E3E3E]">方言地图</h2>
          </div>
          <span className="text-[10px] text-[#9E9E9E] bg-white/80 rounded-full px-2 py-1">锦绣山河 美好中国</span>
        </div>

        {/* Map Container with watercolor style */}
        <div className="relative bg-white rounded-2xl card-shadow overflow-hidden" style={{ height: 460 }}>
          {/* Ocean background - pure blue */}
          <div className="absolute inset-0" style={{ background: '#A8C8D8' }} />

          {/* Cloud decorations */}
          <CloudSVG className="absolute top-2 left-4 w-16 h-7" style={{ opacity: 0.6 }} />
          <CloudSVG className="absolute top-6 right-8 w-12 h-5" style={{ opacity: 0.4 }} />
          <CloudSVG className="absolute bottom-20 left-2 w-10 h-4" style={{ opacity: 0.35 }} />

          {/* Bird decorations */}
          <div className="absolute top-8 left-1/3 text-[#8BA0B0] text-xs" style={{ opacity: 0.4, transform: 'scaleX(-1)' }}>~ ~ ~</div>
          <div className="absolute top-12 right-1/4 text-[#8BA0B0] text-[10px]" style={{ opacity: 0.3 }}>~ ~</div>

          {/* SVG Map with zoom */}
          <div
            ref={mapWrapRef}
            className="absolute inset-0 overflow-hidden touch-none z-10"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <div
              ref={svgContainerRef}
              className="w-full h-full origin-center"
              style={{
                transform: 'translate(' + pan.x + 'px, ' + pan.y + 'px) scale(' + scale + ')',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              dangerouslySetInnerHTML={{ __html: svgContent.replace(/<svg/, '<svg style="width:100%;height:100%;display:block;"') }}
            />
          </div>

          {/* Compass - bottom left */}
          <div className="absolute bottom-3 left-3 z-20">
            <CompassSVG className="w-11 h-11" />
          </div>

          {/* South China Sea inset - bottom right */}
          <div className="absolute bottom-3 right-3 z-20">
            <SouthChinaSeaSVG className="w-20 h-14" />
          </div>

          {/* Selected province tooltip */}
          {selectedProvince && selectedRegionData && !showConfirm && (
            <div className="absolute bottom-16 left-3 right-16 bg-white/95 backdrop-blur-sm rounded-xl p-3 animate-slide-up card-shadow z-20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#8B2635]" />
                    <span className="font-semibold text-sm text-[#3E3E3E]">{selectedRegionData.full} &middot; {selectedRegionData.city}</span>
                    <span className="text-base">{provinceLandmarkMap[selProvince] || ''}</span>
                  </div>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">&ldquo;{selectedRegionData.phrase}&rdquo; &middot; {selectedRegionData.count}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-[#2D5016]/10 flex items-center justify-center transition-transform active:scale-90" onClick={() => setSelectedProvince(null)}>
                    <X size={14} className="text-[#2D5016]" />
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-[#2D5016] text-white text-xs font-medium transition-transform active:scale-90" onClick={() => setShowConfirm(true)}>去学习</button>
                </div>
              </div>
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
              <p className="text-[10px] text-[#5A7A8A] font-medium">{Math.round(scale * 100)}%</p>
            </div>
            <button
              className="w-7 h-7 bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-[#5A7A8A] text-lg font-bold active:bg-white/90"
              onClick={() => setScale(s => Math.min(s + 0.5, 8))}
            >+</button>
            <button
              className="w-7 h-7 bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-[#5A7A8A] text-lg font-bold active:bg-white/90"
              onClick={() => { setScale(1); setPan({ x: 0, y: 0 }) }}
            >⟲</button>
            <button
              className="w-7 h-7 bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-[#5A7A8A] text-lg font-bold active:bg-white/90"
              onClick={() => setScale(s => Math.max(s - 0.5, 1))}
            >-</button>
          </div>

          {/* Title overlay */}
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1.5">
              <p className="text-[11px] text-[#5A7A8A] font-medium">中国方言地图</p>
            </div>
          </div>
        </div>

        {/* Province quick-access grid */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[#3E3E3E] mb-2">热门地区</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {allRegions.slice(0, 15).map(r => {
              const isSelected = selectedProvince === r.short
              return (
                <button
                  key={r.short}
                  className={"flex flex-col items-center gap-0.5 py-2 rounded-xl text-center transition-all active:scale-95 " + (isSelected ? "bg-[#2D5016] text-white" : "bg-white card-shadow")}
                  onClick={() => { setSelectedProvince(r.short); setShowConfirm(true) }}
                >
                  <span className="text-base leading-none">{provinceLandmarkMap[r.short] || "\u{1F4CD}"}</span>
                  <span className={"text-[10px] font-medium " + (isSelected ? "text-white" : "text-[#3E3E3E]")}>{r.short}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && selectedRegionData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl card-shadow-lg p-6 mx-6 max-w-[320px] w-full animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl" style={{ background: (provinceColorMap[selProvince] || "#F5F1E8") + "80" }}>
              {provinceLandmarkMap[selProvince] || "\u{1F4CD}"}
            </div>
            <h3 className="text-lg font-bold text-[#3E3E3E]">{selectedRegionData.full}</h3>
            <p className="text-sm text-[#9E9E9E] mt-1">{selectedRegionData.city}</p>
            <div className="mt-3 rounded-xl p-3" style={{ background: (provinceColorMap[selProvince] || "#F5F1E8") + "60" }}>
              <p className="text-sm text-[#3E3E3E] font-medium">&ldquo;{selectedRegionData.phrase}&rdquo;</p>
              <p className="text-xs text-[#9E9E9E] mt-1">已收集 {selectedRegionData.count} 条乡音</p>
            </div>
            <p className="text-sm text-[#3E3E3E] text-center my-4">是否开始学习打卡该地区方言？</p>
            <div className="space-y-2">
              <button className="w-full h-12 bg-[#2D5016] rounded-xl text-white text-sm font-medium transition-transform active:scale-95" onClick={handleStartChallenge}>开始挑战</button>
              <button className="w-full h-12 bg-[#F5F1E8] rounded-xl text-[#9E9E9E] text-sm font-medium transition-transform active:scale-95" onClick={() => setShowConfirm(false)}>我再考虑一下</button>
            </div>
          </div>
        </div>
      )}

      {/* Listen Section */}
      <div className="px-4 mt-5">
        <h2 className="text-lg font-semibold text-[#3E3E3E] mb-3">听听看</h2>
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          {sampleAudioClips.map((audio, i) => {
            const region = allRegions.find(r => r.short === audio.region)
            const isPlaying = playingAudio === audio.region
            return (
              <button key={i} className={"w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#F5F1E8] last:border-0 transition-colors active:bg-[#F5F1E8] " + (isPlaying ? "bg-[#2D5016]/5" : "")}
                onClick={() => setPlayingAudio(isPlaying ? null : audio.region)}>
                <div className={"w-10 h-10 rounded-full flex items-center justify-center shrink-0 " + (isPlaying ? "bg-[#2D5016]" : "bg-[#F5F1E8]")}>
                  {isPlaying ? <Volume2 size={16} className="text-white" /> : <Play size={14} className={"ml-0.5 " + (isPlaying ? "text-white" : "text-[#2D5016]")} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{provinceLandmarkMap[audio.region] || ""}</span>
                    <span className="text-sm font-medium text-[#3E3E3E]">{audio.region}话</span>
                    {region && <span className="text-[10px] text-[#9E9E9E]">{region.city}</span>}
                  </div>
                  <p className="text-xs text-[#9E9E9E]">{audio.text}</p>
                </div>
                <div className="flex items-end gap-[2px] h-5">
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.7].map((h, j) => (
                    <div key={j} className="w-[2px] bg-[#2D5016]/60 rounded-full transition-all"
                      style={{ height: isPlaying ? String(h * 20) + "px" : "4px", animation: isPlaying ? "waveform 0.8s ease-in-out infinite " + String(j * 0.08) + "s" : "none" }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Wiki Carousel */}
      <div className="mt-5 pb-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-semibold text-[#3E3E3E]">方言小百科</h2>
          <button className="text-xs text-[#2D5016] flex items-center gap-0.5" onClick={() => selectWiki('all')}>
            全部 <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 snap-x snap-mandatory">
          {wikiItems.map(item => (
            <button key={item.id} className="snap-start shrink-0 w-[280px] bg-white rounded-2xl card-shadow overflow-hidden text-left"
              onClick={() => selectWiki(item.id)}>
              <div className="h-24 relative" style={{ background: item.color }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-[#3E3E3E] line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-1 mt-2 text-[#9E9E9E]">
                  <BookOpen size={12} />
                  <span className="text-[11px]">{item.readTime}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="h-4" />
    </div>
  )
}
