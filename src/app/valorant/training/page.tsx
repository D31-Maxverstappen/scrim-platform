import { notFound } from 'next/navigation'
import { TRAINING_ENABLED } from '@/lib/features'
import ReactionTest from '@/components/training/ReactionTest'

// 트레이닝(연습실). 라이브에선 플래그 OFF면 차단, 개발(dev)에선 항상 접근 가능.
export default function TrainingPage() {
  if (!TRAINING_ENABLED && process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-white font-black text-2xl mb-1">트레이닝</h1>
      <p className="text-slate-500 text-sm mb-6">에임·반응을 다듬는 연습실 · Pro 후보 (개발 중)</p>

      {/* 모드 선택 */}
      <div className="flex gap-2 mb-6">
        <span className="px-3 py-1.5 rounded text-xs font-bold bg-[#00D2BE] text-[#04342c]">반응 속도</span>
        <span className="px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-500 cursor-not-allowed" title="곧 추가됩니다">플래시 피하기 (3D) · 준비 중</span>
      </div>

      <ReactionTest />
    </div>
  )
}
