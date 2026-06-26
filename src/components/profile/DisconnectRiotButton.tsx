'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DisconnectRiotButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDisconnect = async () => {
    setLoading(true)
    const res = await fetch('/api/riot/disconnect', { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? '연동 해제 실패')
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">연동을 해제하면 라이엇 데이터가 삭제돼요.</span>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 rounded"
        >
          {loading ? '...' : '해제'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs font-bold px-3 py-1.5 bg-white/5 text-slate-400 hover:bg-white/10 transition rounded"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-slate-500 hover:text-red-400 transition"
    >
      연동 해제
    </button>
  )
}
