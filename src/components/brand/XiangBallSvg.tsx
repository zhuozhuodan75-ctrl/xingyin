export type BallVariant = 'front' | 'happy' | 'angry' | 'peek' | 'side' | 'back' | 'top'

interface XiangBallSvgProps {
  variant?: BallVariant
  size?: number
  className?: string
  /** 是否显示「乡」字 */
  showXiang?: boolean
}

const PALETTE = {
  dark: '#1a3310',
  mid: '#2D5016',
  base: '#4A7C32',
  light: '#7CB356',
  pale: '#A8D88A',
  highlight: '#C5E8A8',
  stroke: '#1a3310',
}

function ballGradient(id: string, base: string, light: string, dark: string) {
  return (
    <radialGradient id={id} cx="35%" cy="32%" r="65%">
      <stop offset="0%" stopColor={light} />
      <stop offset="55%" stopColor={base} />
      <stop offset="100%" stopColor={dark} />
    </radialGradient>
  )
}

function SingleBall({
  cx,
  cy,
  r,
  gradId,
  base,
  light,
  dark,
  showXiang = false,
  xiangSize = 14,
}: {
  cx: number
  cy: number
  r: number
  gradId: string
  base: string
  light: string
  dark: string
  showXiang?: boolean
  xiangSize?: number
}) {
  return (
    <>
      <defs>{ballGradient(gradId, base, light, dark)}</defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} stroke={PALETTE.stroke} strokeWidth={r * 0.04} strokeOpacity={0.25} />
      <ellipse cx={cx - r * 0.28} cy={cy - r * 0.32} rx={r * 0.22} ry={r * 0.14} fill="#fff" opacity={0.35} />
      {showXiang && (
        <text
          x={cx}
          y={cy + xiangSize * 0.35}
          textAnchor="middle"
          fill="#fff"
          fontSize={xiangSize}
          fontFamily='"Noto Serif SC", serif'
          fontWeight="700"
          opacity={0.95}
        >
          乡
        </text>
      )}
    </>
  )
}

/** 乡音 IP · 绿色圆球（馒头蛙品种的视觉形态） */
export default function XiangBallSvg({
  variant = 'front',
  size = 80,
  className = '',
  showXiang = true,
}: XiangBallSvgProps) {
  const uid = `ball-${variant}-${size}`

  const tones: Record<BallVariant, { base: string; light: string; dark: string }> = {
    front: { base: PALETTE.base, light: PALETTE.highlight, dark: PALETTE.mid },
    happy: { base: PALETTE.light, light: '#D4F0B8', dark: PALETTE.base },
    angry: { base: PALETTE.mid, light: PALETTE.base, dark: PALETTE.dark },
    peek: { base: PALETTE.base, light: PALETTE.highlight, dark: PALETTE.mid },
    side: { base: PALETTE.base, light: PALETTE.pale, dark: PALETTE.mid },
    back: { base: PALETTE.mid, light: PALETTE.base, dark: PALETTE.dark },
    top: { base: PALETTE.light, light: PALETTE.highlight, dark: PALETTE.base },
  }

  const t = tones[variant]

  if (variant === 'peek') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
        <defs>
          <clipPath id={`${uid}-clip`}>
            <rect x="0" y="42" width="100" height="58" />
          </clipPath>
          {ballGradient(`${uid}-g`, t.base, t.light, t.dark)}
        </defs>
        <g clipPath={`url(#${uid}-clip)`}>
          <circle cx="50" cy="68" r="34" fill={`url(#${uid}-g)`} stroke={PALETTE.stroke} strokeWidth="1.2" strokeOpacity="0.2" />
          <ellipse cx="38" cy="52" rx="8" ry="5" fill="#fff" opacity={0.35} />
          {showXiang && (
            <text x="50" y="72" textAnchor="middle" fill="#fff" fontSize="16" fontFamily='"Noto Serif SC", serif' fontWeight="700">乡</text>
          )}
        </g>
        <line x1="10" y1="42" x2="90" y2="42" stroke={PALETTE.stroke} strokeWidth="1" strokeOpacity="0.12" />
      </svg>
    )
  }

  if (variant === 'side') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
        <defs>{ballGradient(`${uid}-g`, t.base, t.light, t.dark)}</defs>
        <ellipse cx="54" cy="52" rx="28" ry="34" fill={`url(#${uid}-g)`} stroke={PALETTE.stroke} strokeWidth="1.2" strokeOpacity="0.2" />
        <ellipse cx="44" cy="38" rx="7" ry="5" fill="#fff" opacity={0.3} />
        {showXiang && (
          <text x="54" y="56" textAnchor="middle" fill="#fff" fontSize="14" fontFamily='"Noto Serif SC", serif' fontWeight="700">乡</text>
        )}
      </svg>
    )
  }

  if (variant === 'top') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
        <defs>{ballGradient(`${uid}-g`, t.base, t.light, t.dark)}</defs>
        <circle cx="50" cy="50" r="36" fill={`url(#${uid}-g)`} stroke={PALETTE.stroke} strokeWidth="1.2" strokeOpacity="0.2" />
        <ellipse cx="42" cy="42" rx="10" ry="7" fill="#fff" opacity={0.35} />
        {showXiang && (
          <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="15" fontFamily='"Noto Serif SC", serif' fontWeight="700">乡</text>
        )}
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <SingleBall cx={50} cy={50} r={38} gradId={`${uid}-g`} base={t.base} light={t.light} dark={t.dark} showXiang={showXiang} xiangSize={variant === 'back' ? 0 : 18} />
      {variant === 'back' && showXiang && (
        <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="16" fontFamily='"Noto Serif SC", serif' fontWeight="700" opacity={0.85}>乡</text>
      )}
    </svg>
  )
}

/** Logo / App 图标 · 多颗不同明度大小的绿球组合 */
export function BallClusterLogo({
  size = 80,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-label="乡音">
      <defs>
        {ballGradient('bc1', PALETTE.dark, PALETTE.mid, '#0f1f0a')}
        {ballGradient('bc2', PALETTE.base, PALETTE.light, PALETTE.mid)}
        {ballGradient('bc3', PALETTE.light, PALETTE.highlight, PALETTE.base)}
        {ballGradient('bc4', PALETTE.pale, '#D4F0B8', PALETTE.light)}
        {ballGradient('bc5', '#E67E22', '#F5B041', '#C0651A')}
      </defs>
      {/* 大球 · 深 */}
      <circle cx="38" cy="58" r="26" fill="url(#bc1)" />
      <ellipse cx="28" cy="48" rx="6" ry="4" fill="#fff" opacity="0.2" />
      {/* 中球 · 主色 */}
      <circle cx="62" cy="44" r="20" fill="url(#bc2)" />
      <ellipse cx="54" cy="36" rx="5" ry="3" fill="#fff" opacity="0.28" />
      <text x="62" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontFamily='"Noto Serif SC", serif' fontWeight="700">乡</text>
      {/* 小球 · 亮 */}
      <circle cx="72" cy="68" r="13" fill="url(#bc3)" />
      <ellipse cx="67" cy="62" rx="3" ry="2" fill="#fff" opacity="0.35" />
      {/* 最小 · 淡 */}
      <circle cx="48" cy="72" r="9" fill="url(#bc4)" />
      <ellipse cx="45" cy="68" rx="2.5" ry="1.5" fill="#fff" opacity="0.4" />
      {/* 点缀 · 暖橙 */}
      <circle cx="78" cy="32" r="7" fill="url(#bc5)" />
      <ellipse cx="75" cy="29" rx="2" ry="1.2" fill="#fff" opacity="0.35" />
    </svg>
  )
}

export type { BallVariant as MantouVariant }
