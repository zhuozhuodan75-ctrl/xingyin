import { useState, useCallback, useRef, useEffect } from 'react'
import XiangBallSvg from './brand/XiangBallSvg'

// Preload audio
let audioInstance: HTMLAudioElement | null = null
function getAudio() {
  if (!audioInstance) {
    audioInstance = new Audio('/audio/frog_gua.mp3')
    audioInstance.volume = 0.6
  }
  return audioInstance
}

export function playGuaSound() {
  try {
    const audio = getAudio()
    audio.currentTime = 0
    audio.play().catch(() => {})
  } catch {
    // ignore audio errors
  }
}

// ============ Title Peek Effect - Frog peeks from behind "乡音" text ============
interface TitlePeekProps {
  className?: string
}

export function MantouTitlePeek({ className = '' }: TitlePeekProps) {
  const [peeking, setPeeking] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerPeek = useCallback(() => {
    if (peeking) return
    setPeeking(true)
    playGuaSound()

    // Show speech bubble after frog appears
    setTimeout(() => setShowBubble(true), 300)

    // Hide after animation
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setShowBubble(false)
      setTimeout(() => setPeeking(false), 200)
    }, 1800)
  }, [peeking])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className={`relative inline-block ${className}`} onClick={triggerPeek}>
      {/* The title text */}
      <span className="relative z-10 cursor-pointer select-none text-[15px] font-semibold text-white/60 transition-colors hover:text-white/80">
        乡音
      </span>

      {/* Frog peeking from behind text */}
      {peeking && (
        <div
          className="absolute z-20 transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'frog-peek-up 0.4s ease-out forwards',
          }}
        >
          <XiangBallSvg variant="peek" size={40} className="drop-shadow-md" />
        </div>
      )}

      {/* Speech bubble with "呱" */}
      {showBubble && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: -52,
            left: '50%',
            transform: 'translateX(-20%)',
            animation: 'bubble-pop 0.3s ease-out forwards',
          }}
        >
          <div className="relative bg-white rounded-xl px-2.5 py-1 shadow-lg">
            <span className="text-xs font-bold text-[#2D5016]">呱!</span>
            {/* Little triangle pointing down */}
            <div
              className="absolute -bottom-1 left-3 w-2 h-2 bg-white rotate-45"
            />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes frog-peek-up {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.6); }
          60% { opacity: 1; transform: translateX(-50%) translateY(-2px) scale(1.05); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes bubble-pop {
          0% { opacity: 0; transform: translateX(-20%) scale(0.5); }
          70% { opacity: 1; transform: translateX(-20%) scale(1.1); }
          100% { opacity: 1; transform: translateX(-20%) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ============ Button Pop Effect - Frog pops from button edge ============
interface ButtonPopData {
  id: number
  x: number
  y: number
}

let popIdCounter = 0

export function useMantouButtonPop() {
  const [pops, setPops] = useState<ButtonPopData[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const triggerPop = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const id = ++popIdCounter
    const x = rect.left + rect.width / 2 - containerRect.left
    const y = rect.top - containerRect.top

    setPops(prev => [...prev, { id, x, y }])
    playGuaSound()

    setTimeout(() => {
      setPops(prev => prev.filter(p => p.id !== id))
    }, 1000)
  }, [])

  // Global click listener for button effects
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('button')
      if (button && container.contains(button)) {
        // Add green flash effect to button
        const originalBg = (button as HTMLElement).style.backgroundColor
        ;(button as HTMLElement).style.backgroundColor = '#2D5016'
        ;(button as HTMLElement).style.color = '#fff'
        setTimeout(() => {
          ;(button as HTMLElement).style.backgroundColor = originalBg
          ;(button as HTMLElement).style.color = ''
        }, 300)

        // Trigger frog pop
        triggerPop(button as HTMLElement)
      }
    }

    container.addEventListener('click', handleClick, true)
    return () => container.removeEventListener('click', handleClick, true)
  }, [triggerPop])

  const PopElements = useCallback(() => (
    <>
      {pops.map(pop => (
        <div
          key={pop.id}
          className="absolute z-[100] pointer-events-none"
          style={{
            left: pop.x,
            top: pop.y,
            transform: 'translate(-50%, -100%)',
            animation: 'frog-button-pop 0.8s ease-out forwards',
          }}
        >
          <XiangBallSvg variant="happy" size={44} className="drop-shadow-md" />
        </div>
      ))}
      <style>{`
        @keyframes frog-button-pop {
          0% { opacity: 0; transform: translate(-50%, -80%) scale(0.3) rotate(-10deg); }
          30% { opacity: 1; transform: translate(-50%, -110%) scale(1.1) rotate(5deg); }
          60% { opacity: 1; transform: translate(-50%, -100%) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -130%) scale(0.6) rotate(0deg); }
        }
      `}</style>
    </>
  ), [pops])

  return { containerRef, PopElements }
}

// ============ Simple floating frog decoration ============
interface FloatingMantouProps {
  className?: string
  size?: number
}

export function FloatingMantou({ className = '', size = 40 }: FloatingMantouProps) {
  return (
    <XiangBallSvg variant="front" size={size} className={`drop-shadow-sm ${className}`} />
  )
}

// ============ Gua Speech Bubble standalone ============
interface GuaBubbleProps {
  show: boolean
  className?: string
}

export function GuaBubble({ show, className = '' }: GuaBubbleProps) {
  if (!show) return null
  return (
    <div className={`relative bg-white rounded-xl px-3 py-1.5 shadow-lg ${className}`}>
      <span className="text-sm font-bold text-[#2D5016]">呱!</span>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
    </div>
  )
}
