'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MatchEndButton({
  matchId,
  team1Id,
  team1Name,
  team2Id,
  team2Name,
}: {
  matchId: string
  team1Id: string
  team1Name: string
  team2Id: string
  team2Name: string
}) {
  const [step, setStep] = useState<'idle' | 'pick'>('idle')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const end = async (winnerId: string | null) => {
    setLoading(true)
    const res = await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_id: winnerId }),
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const d = await res.json()
      alert(d.error ?? '종료 실패')
      setStep('idle')
    }
  }

  if (step === 'pick') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">승리 팀 선택</span>
        <button
          onClick={() => end(team1Id)}
          disabled={loading}
          className="text-xs font-bold px-3 py-1.5 bg-[#00D2BE]/20 text-[#00D2BE] hover:bg-[#00D2BE]/30 transition disabled:opacity-50 rounded"
        >
          {team1Name}
        </button>
        <button
          onClick={() => end(team2Id)}
          disabled={loading}
          className="text-xs font-bold px-3 py-1.5 bg-[#00D2BE]/20 text-[#00D2BE] hover:bg-[#00D2BE]/30 transition disabled:opacity-50 rounded"
        >
          {team2Name}
        </button>
        <button
          onClick={() => end(null)}
          disabled={loading}
          className="text-xs font-bold px-3 py-1.5 bg-white/5 text-slate-400 hover:bg-white/10 transition disabled:opacity-50 rounded"
        >
          무승부
        </button>
        <button
          onClick={() => setStep('idle')}
          className="text-xs text-slate-600 hover:text-slate-400 transition"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setStep('pick')}
      className="text-xs font-bold px-4 py-2 bg-[#00D2BE]/10 text-[#00D2BE] hover:bg-[#00D2BE]/20 border border-[#00D2BE]/20 hover:border-[#00D2BE]/40 transition rounded"
    >
      스크림 종료
    </button>
  )
}
