import { useState, useCallback, useEffect } from 'react'
import { useApp } from '../App'
import XiangyinLogo from '@/components/brand/XiangyinLogo'
import { playGuaSound } from '@/components/MantouFrog'

type SplashPhase = 'showing' | 'clouds-in' | 'clouds-fade' | 'done'

/*
  Animation timeline after click:
  0ms     : "乡音" text fades out quickly
  0-800ms : 4 corner clouds scale up & move toward center, covering screen
  800ms   : Full-screen cloud cover
  800-2000ms : Clouds slowly fade to white
  2000ms  : Navigate to home
*/

export default function SplashScreen() {
  const { navigate, setActiveTab } = useApp()
  const [phase, setPhase] = useState<SplashPhase>('showing')

  const handleClick = useCallback(() => {
    if (phase !== 'showing') return
    setPhase('clouds-in')
  }, [phase])

  const handleLogoPeek = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (phase !== 'showing') return
    playGuaSound()
  }, [phase])

  // Phase transitions
  useEffect(() => {
    if (phase === 'clouds-in') {
      // After clouds cover screen, start fading them
      const t1 = setTimeout(() => setPhase('clouds-fade'), 900)
      return () => clearTimeout(t1)
    }
    if (phase === 'clouds-fade') {
      // After clouds fade away, navigate
      const t2 = setTimeout(() => {
        setPhase('done')
        setActiveTab('home')
        navigate('home')
      }, 1200)
      return () => clearTimeout(t2)
    }
  }, [phase, navigate, setActiveTab])

  if (phase === 'done') return null

  const isShowing = phase === 'showing'
  const isCloudsIn = phase === 'clouds-in'
  const isCloudsFade = phase === 'clouds-fade'

  // Cloud visibility
  const cloudOpacity = isShowing ? 0.22 : isCloudsIn ? 1 : 0
  const pageOpacity = isCloudsFade ? 0 : 1

  return (
    <div
      className="h-full w-full relative overflow-hidden select-none cursor-pointer"
      style={{
        background: '#FAFAF7',
        opacity: pageOpacity,
        transition: isCloudsFade ? 'opacity 1.1s ease-out' : 'none',
      }}
      onClick={handleClick}
    >
      {/* ===== Corner Clouds (SVG) ===== */}
      {/* Top-left cloud */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -40,
          left: -60,
          width: 280,
          height: 200,
          opacity: cloudOpacity,
          transform: isShowing
            ? 'translate(0, 0) scale(1)'
            : 'translate(60px, 80px) scale(4.5)',
          transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <svg viewBox="0 0 280 200" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,120 Q20,60 80,50 Q100,10 160,25 Q200,0 250,30 Q280,60 270,100 Q260,140 220,160 Q240,190 180,195 L20,195 Q-10,170 0,120Z" fill="#E8F0E0" />
          <path d="M30,100 Q50,55 100,48 Q120,20 170,32 Q200,15 240,40 Q260,70 245,105 Q230,135 190,150 L40,150 Q15,135 30,100Z" fill="#D4E8C8" opacity="0.7" />
          <path d="M60,85 Q75,58 115,52 Q130,32 168,42 Q190,28 220,48 Q238,68 225,95 Q212,118 175,130 L62,130 Q45,115 60,85Z" fill="#C0D8B0" opacity="0.5" />
        </svg>
      </div>

      {/* Top-right cloud */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -50,
          right: -80,
          width: 320,
          height: 220,
          opacity: cloudOpacity,
          transform: isShowing
            ? 'translate(0, 0) scale(1)'
            : 'translate(-80px, 60px) scale(4)',
          transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <svg viewBox="0 0 320 220" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M10,140 Q40,70 100,60 Q130,15 190,35 Q240,5 290,40 Q320,80 300,130 Q280,170 230,185 Q250,215 180,218 L20,218 Q-10,185 10,140Z" fill="#E8F0E0" />
          <path d="M40,115 Q65,62 120,52 Q145,22 195,38 Q235,18 275,48 Q300,78 280,118 Q260,150 210,165 L48,165 Q25,148 40,115Z" fill="#D4E8C8" opacity="0.7" />
          <path d="M70,95 Q90,58 135,50 Q155,32 190,45 Q220,30 250,55 Q270,78 252,105 Q235,128 195,138 L72,138 Q55,122 70,95Z" fill="#C0D8B0" opacity="0.5" />
        </svg>
      </div>

      {/* Bottom-left cloud */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -60,
          left: -80,
          width: 300,
          height: 240,
          opacity: cloudOpacity,
          transform: isShowing
            ? 'translate(0, 0) scale(1)'
            : 'translate(100px, -120px) scale(4.2)',
          transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <svg viewBox="0 0 300 240" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M20,60 Q50,130 110,140 Q140,195 200,170 Q250,220 280,170 Q310,130 280,80 Q260,30 200,35 Q160,0 100,25 Q40,15 20,60Z" fill="#E8F0E0" />
          <path d="M45,80 Q70,135 125,145 Q150,188 195,168 Q235,205 260,165 Q278,132 252,92 Q230,55 175,58 Q140,28 88,48 Q48,40 45,80Z" fill="#D4E8C8" opacity="0.7" />
          <path d="M70,100 Q90,140 135,150 Q155,178 190,160 Q220,185 238,155 Q252,130 228,100 Q205,75 155,78 Q125,55 82,72 Q68,68 70,100Z" fill="#C0D8B0" opacity="0.5" />
        </svg>
      </div>

      {/* Bottom-right cloud */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -40,
          right: -60,
          width: 290,
          height: 210,
          opacity: cloudOpacity,
          transform: isShowing
            ? 'translate(0, 0) scale(1)'
            : 'translate(-100px, -100px) scale(4.3)',
          transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <svg viewBox="0 0 290 210" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M30,50 Q60,120 120,130 Q150,180 210,155 Q260,200 285,155 Q305,115 275,65 Q250,20 190,25 Q145,-5 85,20 Q30,10 30,50Z" fill="#E8F0E0" />
          <path d="M55,70 Q80,125 130,135 Q155,172 200,152 Q240,185 262,148 Q278,118 252,80 Q228,45 175,48 Q140,22 90,42 Q50,35 55,70Z" fill="#D4E8C8" opacity="0.7" />
          <path d="M80,88 Q100,128 140,138 Q160,162 192,145 Q222,165 238,140 Q252,118 228,92 Q205,68 158,70 Q130,50 88,65 Q75,62 80,88Z" fill="#C0D8B0" opacity="0.5" />
        </svg>
      </div>

      {/* ===== Center Content ===== */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          style={{
            opacity: isShowing ? 1 : 0,
            transform: isShowing ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-12px)',
            transition: 'all 0.5s ease-out',
          }}
          onClick={handleLogoPeek}
        >
          <XiangyinLogo variant="splash" size={160} />
        </div>

        {/* Tap hint */}
        <div
          className="absolute bottom-28 left-0 right-0 flex flex-col items-center"
          style={{ opacity: isShowing ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
          <div className="w-7 h-7 rounded-full border border-[#2D5016]/20 flex items-center justify-center mb-2 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2D5016]/30" />
          </div>
          <p className="text-[11px]" style={{ color: '#2D5016', opacity: 0.3, letterSpacing: '0.2em' }}>
            点击任意处进入
          </p>
        </div>
      </div>

      {/* Bottom brand */}
      <div
        className="absolute bottom-5 left-0 right-0 text-center"
        style={{ opacity: isShowing ? 1 : 0, transition: 'opacity 0.3s ease' }}
      >
        <p className="text-[10px]" style={{ color: '#2D5016', opacity: 0.18, letterSpacing: '0.25em' }}>
          乡音 APP
        </p>
      </div>
    </div>
  )
}
