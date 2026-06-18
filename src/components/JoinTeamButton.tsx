'use client'

import { useState } from 'react'

export default function JoinTeamButton({ teamId, hasPendingRequest }: { teamId: string, hasPendingRequest: boolean }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>(hasPendingRequest ? 'done' : 'idle')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    setLoading(true)
    const res = await fetch(`/api/teams/${teamId}/join`, { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (res.ok) setStatus('done')
    else setStatus('error')
  }

  if (status === 'done') return (
    <span className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#00D2BE]/20 text-[#00D2BE]">
      신청 완료 ✓
    </span>
  )

  if (status === 'error') return (
    <span className="text-xs font-bold px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400">
      오류 발생
    </span>
  )

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
    >
      {loading ? '신청 중...' : '가입 신청'}
    </button>
  )
}
