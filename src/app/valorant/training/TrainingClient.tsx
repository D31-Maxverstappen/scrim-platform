'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ReactionTest from '@/components/training/ReactionTest'

// 트레이닝 모드 전환. FlashDodge는 three.js(window 의존) → SSR 끄고 동적 로드.
const FlashDodge = dynamic(() => import('@/components/training/FlashDodge'), {
  ssr: false,
  loading: () => <div className="text-slate-500 text-sm py-12">3D 로딩 중…</div>,
})

type Mode = 'reaction' | 'flash'

export default function TrainingClient() {
  const [mode, setMode] = useState<Mode>('reaction')

  const tab = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      className={`px-3 py-1.5 rounded text-xs font-bold transition ${mode === m ? 'bg-[#00D2BE] text-[#04342c]' : 'bg-white/5 text-slate-400 hover:text-white'}`}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="flex gap-2 mb-6">
        {tab('reaction', '반응 속도')}
        {tab('flash', '플래시 피하기 (3D)')}
      </div>
      {mode === 'reaction' ? <ReactionTest /> : <FlashDodge />}
    </>
  )
}
