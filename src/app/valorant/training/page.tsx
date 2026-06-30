import { notFound } from 'next/navigation'
import { TRAINING_ENABLED } from '@/lib/features'
import TrainingClient from './TrainingClient'

// 트레이닝(연습실). 라이브에선 플래그 OFF면 차단, 개발(dev)에선 항상 접근 가능.
export default function TrainingPage() {
  if (!TRAINING_ENABLED && process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-white font-black text-2xl mb-1">트레이닝</h1>
      <p className="text-slate-500 text-sm mb-6">에임·반응을 다듬는 연습실 · Pro 후보 (개발 중)</p>
      <TrainingClient />
    </div>
  )
}
