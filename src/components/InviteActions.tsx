'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InviteActions({ inviteId, status, teamId }: {
  inviteId: string
  status: string
  teamId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(status !== 'pending')
  const [finalStatus, setFinalStatus] = useState(status)

  if (done) {
    return (
      <div className="text-center py-2">
        {finalStatus === 'accepted' ? (
          <div>
            <p className="text-[#00D2BE] font-bold text-sm mb-3">팀에 합류했어요!</p>
            <a href={`/teams/${teamId}`} className="text-[#00D2BE] text-xs hover:underline">팀 페이지 보기 →</a>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">초대를 거절했어요</p>
        )}
      </div>
    )
  }

  const handle = async (action: 'accept' | 'decline') => {
    setLoading(action)
    setError('')
    const res = await fetch(`/api/invites/${inviteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (res.ok) {
      setFinalStatus(action === 'accept' ? 'accepted' : 'declined')
      setDone(true)
      if (action === 'accept') router.refresh()
    } else {
      setError(data.error ?? '오류가 발생했어요')
    }
    setLoading(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>}
      <button
        onClick={() => handle('accept')}
        disabled={!!loading}
        className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-bold py-3 rounded transition"
      >
        {loading === 'accept' ? '처리 중...' : '초대 수락'}
      </button>
      <button
        onClick={() => handle('decline')}
        disabled={!!loading}
        className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-400 font-semibold py-3 rounded transition"
      >
        {loading === 'decline' ? '처리 중...' : '거절'}
      </button>
    </div>
  )
}
