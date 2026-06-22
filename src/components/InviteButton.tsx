'use client'

import { useState } from 'react'

export default function InviteButton({
  type,
  targetId,
  userId,
}: {
  type: 'team' | 'inhouse'
  targetId: string
  userId: string
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied'>('idle')

  const handleClick = async () => {
    setState('loading')
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, userId }),
      })
      if (!res.ok) { setState('idle'); return }
      const { token } = await res.json()
      const url = `${window.location.origin}/invite/${token}`
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        prompt('아래 링크를 복사하세요', url)
      }
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
        state === 'copied'
          ? 'bg-green-500/10 text-green-400'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      } disabled:opacity-50`}
    >
      {state === 'copied' ? '✓ 복사됨' : state === 'loading' ? '생성 중...' : '🔗 초대 링크 복사'}
    </button>
  )
}
