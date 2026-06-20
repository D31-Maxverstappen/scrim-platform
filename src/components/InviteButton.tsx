'use client'

import { useState } from 'react'

export default function InviteButton({
  teamId, teamName, targetUserId, targetUserName, targetUserTeamId
}: {
  teamId: string
  teamName: string
  targetUserId: string
  targetUserName: string
  targetUserTeamId: string | null
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  if (targetUserTeamId) {
    return <span className="text-slate-600 text-xs">이미 팀 소속</span>
  }

  const handleInvite = async () => {
    setStatus('loading')
    const res = await fetch(`/api/teams/${teamId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('sent')
      setMsg('초대를 보냈어요!')
    } else {
      setStatus('error')
      setMsg(data.error ?? '오류가 발생했어요')
    }
  }

  if (status === 'sent') {
    return <span className="text-[#00D2BE] text-xs font-semibold">초대 전송됨 ✓</span>
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleInvite}
        disabled={status === 'loading'}
        className="bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded transition shrink-0"
      >
        {status === 'loading' ? '보내는 중...' : `${teamName}으로 초대`}
      </button>
      {status === 'error' && <p className="text-red-400 text-xs">{msg}</p>}
    </div>
  )
}
