import { notFound } from 'next/navigation'
import { STRATEGY_BOARD_ENABLED } from '@/lib/features'
import BoardClient from './BoardClient'

// 라이브(production)에선 플래그 OFF면 차단, 개발(dev)에선 항상 접근 가능 → 미완성 미노출.
export default function StrategyBoardPage() {
  if (!STRATEGY_BOARD_ENABLED && process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-white font-black text-2xl mb-1">전략 노트 작전판</h1>
      <p className="text-slate-500 text-sm mb-6">맵 위에 작전을 그려 PNG로 저장 · Pro 후보 (MVP)</p>
      <BoardClient />
    </div>
  )
}
