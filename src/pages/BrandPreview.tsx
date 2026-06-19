import XiangBallSvg, { BallClusterLogo, type BallVariant } from '@/components/brand/XiangBallSvg'
import XiangyinLogo from '@/components/brand/XiangyinLogo'
import { playGuaSound } from '@/components/MantouFrog'
import { useState } from 'react'

const variants: { key: BallVariant; label: string }[] = [
  { key: 'front', label: '正面' },
  { key: 'happy', label: '明亮' },
  { key: 'angry', label: '深绿' },
  { key: 'side', label: '侧面' },
  { key: 'back', label: '背面' },
  { key: 'top', label: '顶视' },
  { key: 'peek', label: '探头' },
]

export default function BrandPreview() {
  const [peek, setPeek] = useState(false)
  const [popDemo, setPopDemo] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-10 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center">
          <BallClusterLogo size={72} className="mx-auto mb-4" />
          <p className="text-xs text-[#9E9E9E] tracking-widest mb-2">品牌预览 · 确认后全 App 生效</p>
          <h1 className="text-2xl font-bold text-[#2D5016]" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            乡音 · 绿球 IP
          </h1>
          <p className="text-sm text-[#888] mt-2">Logo = 多颗不同大小/明度的球 · 按钮点击 = 绿球弹出</p>
          <div className="flex gap-4 justify-center mt-4">
            <a href="/" className="text-sm text-[#2D5016] underline">返回 App</a>
            <span className="text-[#ccc]">|</span>
            <span className="text-sm text-[#888]">地址：/brand</span>
          </div>
        </div>

        <section className="bg-white rounded-2xl p-6 card-shadow">
          <h2 className="text-sm font-semibold text-[#666] mb-5">Logo · 多球组合</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center justify-items-center">
            <div className="text-center">
              <BallClusterLogo size={96} />
              <p className="text-xs text-[#9E9E9E] mt-3">App 图标</p>
            </div>
            <div className="text-center">
              <XiangyinLogo variant="wordmark" size={110} />
              <p className="text-xs text-[#9E9E9E] mt-3">标准字标</p>
            </div>
            <div className="text-center">
              <XiangyinLogo variant="splash" size={140} />
              <p className="text-xs text-[#9E9E9E] mt-3">启动页方案</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 card-shadow">
          <h2 className="text-sm font-semibold text-[#666] mb-5">IP 绿球 · 单颗样式</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {variants.map(v => (
              <div key={v.key} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F5F1E8]">
                <XiangBallSvg variant={v.key} size={72} />
                <span className="text-xs text-[#666]">{v.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 card-shadow text-center space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-[#666] mb-2">互动 · 探头</h2>
            <p className="text-xs text-[#9E9E9E] mb-4">点击「乡音」</p>
            <div className="relative inline-block">
              <span
                className="text-5xl font-bold text-[#2D5016] cursor-pointer select-none"
                style={{ fontFamily: '"Noto Serif SC", serif' }}
                onClick={() => {
                  setPeek(true)
                  playGuaSound()
                  setTimeout(() => setPeek(false), 1600)
                }}
              >
                乡音
              </span>
              {peek && (
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: -32, animation: 'ball-peek 0.4s ease-out forwards' }}>
                  <XiangBallSvg variant="peek" size={44} />
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#666] mb-4">互动 · 按钮边缘弹出（全 App 同款）</h2>
            <button
              type="button"
              className="px-8 py-3 bg-[#2D5016] text-white rounded-xl text-sm font-medium shadow-md active:scale-95 transition-transform relative"
              onClick={() => {
                setPopDemo(true)
                playGuaSound()
                setTimeout(() => setPopDemo(false), 900)
              }}
            >
              点我试一下
              {popDemo && (
                <span className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 pointer-events-none" style={{ animation: 'ball-pop 0.8s ease-out forwards' }}>
                  <XiangBallSvg variant="happy" size={40} />
                </span>
              )}
            </button>
          </div>
        </section>

        <section className="bg-[#2D5016] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-5">深色背景</h2>
          <div className="flex flex-wrap gap-8 items-center justify-center">
            <XiangyinLogo variant="wordmark" size={100} dark />
            <XiangBallSvg variant="happy" size={72} />
          </div>
        </section>
      </div>

      <style>{`
        @keyframes ball-peek {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.5); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes ball-pop {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.3); }
          40% { opacity: 1; transform: translateX(-50%) translateY(-12px) scale(1.1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-24px) scale(0.7); }
        }
      `}</style>
    </div>
  )
}
