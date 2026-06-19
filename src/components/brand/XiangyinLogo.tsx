import { BallClusterLogo } from './XiangBallSvg'
import XiangBallSvg, { type BallVariant } from './XiangBallSvg'

type LogoVariant = 'icon' | 'wordmark' | 'ear' | 'splash'

interface XiangyinLogoProps {
  variant?: LogoVariant
  size?: number
  className?: string
  dark?: boolean
}

/** 乡音 Logo · 多球组合图标 + 字标 */
export default function XiangyinLogo({
  variant = 'wordmark',
  size = 120,
  className = '',
  dark = false,
}: XiangyinLogoProps) {
  const green = dark ? '#E8F0E0' : '#2D5016'
  const sub = dark ? 'rgba(255,255,255,0.6)' : '#888'

  if (variant === 'icon') {
    return <BallClusterLogo size={size} className={className} />
  }

  if (variant === 'ear') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <BallClusterLogo size={size * 0.7} />
        <span style={{ fontFamily: '"Noto Serif SC", serif', fontSize: size * 0.28, color: green, fontWeight: 700 }}>乡音</span>
      </div>
    )
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <BallClusterLogo size={size * 0.55} />
        <div className="text-center">
          <p className="text-4xl font-bold tracking-[0.25em]" style={{ fontFamily: '"Noto Serif SC", serif', color: green }}>
            乡音
          </p>
          <p className="text-xs tracking-[0.35em] mt-1" style={{ color: sub }}>听见一方水土</p>
        </div>
      </div>
    )
  }

  const iconSize = size * 0.38
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <BallClusterLogo size={iconSize} />
      <span
        className="font-bold tracking-[0.12em]"
        style={{ fontFamily: '"Noto Serif SC", serif', fontSize: size * 0.34, color: green }}
      >
        乡音
      </span>
    </div>
  )
}

export { XiangBallSvg as MantouFrogSvg, type BallVariant as MantouVariant, BallClusterLogo }
