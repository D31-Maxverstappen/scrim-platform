'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LeaveTeamButton({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLeave = async () => {
    if (!confirm('정말 팀에서 탈퇴할까요?')) return
    setLoading(true)
    const res = await fetch(`/api/teams/${teamId}/leave`, { method: 'POST' })
    setLoading(false)
    if (res.ok) router.replace('/teams')
  }

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-sm font-semibold px-5 py-2.5 rounded transition disabled:opacity-50"
    >
      {loading ? '탈퇴 중...' : '팀 탈퇴'}
    </button>
  )
}
