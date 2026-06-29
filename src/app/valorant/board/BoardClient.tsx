'use client'

import dynamic from 'next/dynamic'

// Konva는 window 의존(클라이언트 전용) → SSR 끄고 동적 로드. 작전판 페이지에서만 번들 로드.
const StrategyBoard = dynamic(() => import('@/components/board/StrategyBoard'), {
  ssr: false,
  loading: () => <div className="text-slate-500 text-sm py-12">작전판 불러오는 중…</div>,
})

export default function BoardClient() {
  return <StrategyBoard />
}
