'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OPTIONS = [
  { key: 'good',   label: '👍 매너 좋아요',   cls: 'border-[#00D2BE]/40 text-[#00D2BE] hover:bg-[#00D2BE]/10' },
  { key: 'bad',    label: '👎 비매너',        cls: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' },
  { key: 'noshow', label: '⛔ 노쇼·중도이탈', cls: 'border-red-500/40 text-red-400 hover:bg-red-500/10' },
]

export default function MannerRating({ matchId, alreadyRated, opponentName }: { matchId: string; alreadyRated: boolean; opponentName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState(alreadyRated)
  const [error, setError] = useState('')

  const submit = async (rating: string) => {
    setLoading(rating)
    setError('')
    const res = await fetch(`/api/matches/${matchId}/manner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    })
    setLoading(null)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      setError(e.error ?? '오류가 발생했어요.')
      return
    }
    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="border border-white/10 bg-[#13131f] rounded px-5 py-4 mb-4 text-center">
        <p className="text-[#00D2BE] text-sm font-bold">상대 팀 매너 평가 완료 ✓</p>
        <p className="text-slate-500 text-xs mt-0.5">평가해 주셔서 감사해요. 매너 점수에 반영됐어요.</p>
      </div>
    )
  }

  return (
    <div className="border border-white/10 bg-[#13131f] rounded px-5 py-4 mb-4">
      <p className="text-white text-sm font-bold mb-0.5">상대 팀 매너 평가</p>
      <p className="text-slate-500 text-xs mb-3">
        <span className="text-slate-300 font-semibold">{opponentName}</span> 와의 스크림은 어떠셨나요? (캡틴만 평가 가능)
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => submit(o.key)}
            disabled={!!loading}
            className={`px-3.5 py-2 rounded text-xs font-bold border transition disabled:opacity-50 ${o.cls}`}
          >
            {loading === o.key ? '처리 중…' : o.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
