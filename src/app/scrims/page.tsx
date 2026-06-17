'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

const GAMES = [
  { value: '', label: '전체' },
  { value: 'valorant', label: '발로란트' },
  { value: 'lol', label: '리그 오브 레전드' },
  { value: 'overwatch', label: '오버워치 2' },
]

function ScrimsContent() {
  const params = useSearchParams()
  const game = params.get('game') ?? ''

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-14 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">스크림 게시판</h1>
            <p className="text-slate-400 text-sm mt-1">팀을 만들고 스크림 상대를 구해보세요</p>
          </div>
          <a href="/scrims/post" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
            + 스크림 올리기
          </a>
        </div>

        {/* 게임 필터 */}
        <div className="flex gap-2 mb-6">
          {GAMES.map((g) => (
            <a
              key={g.value}
              href={g.value ? `/scrims?game=${g.value}` : '/scrims'}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                game === g.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {g.label}
            </a>
          ))}
        </div>

        {/* 빈 상태 */}
        <div className="text-center text-slate-500 py-24 bg-[#1e1e2e] border border-white/10 rounded-2xl">
          <p className="text-4xl mb-4">🎮</p>
          <p>현재 모집 중인 스크림이 없어요</p>
          <p className="text-sm mt-1">첫 번째로 스크림을 올려보세요!</p>
          <a href="/scrims/post" className="mt-6 inline-block bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-sm px-5 py-2.5 rounded-xl transition">
            + 스크림 올리기
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ScrimsPage() {
  return (
    <Suspense>
      <ScrimsContent />
    </Suspense>
  )
}
