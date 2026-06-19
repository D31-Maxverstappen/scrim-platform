'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MatchCancelButton({ matchId }: { matchId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    const res = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      alert(data.error ?? '취소 실패')
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">정말 취소할까요?</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs font-bold px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
        >
          {loading ? '...' : '확인'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs font-bold px-3 py-1.5 bg-white/5 text-slate-400 hover:bg-white/10 transition"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs font-bold px-4 py-2 bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition"
    >
      매치 취소
    </button>
  )
}
