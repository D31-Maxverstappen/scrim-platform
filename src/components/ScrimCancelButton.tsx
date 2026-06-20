'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScrimCancelButton({ scrimId }: { scrimId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    const res = await fetch(`/api/scrims/${scrimId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/scrims')
      router.refresh()
    }
    setLoading(false)
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-slate-500 hover:text-red-400 text-xs font-semibold border border-white/10 hover:border-red-400/30 px-4 py-2 rounded transition"
      >
        게시 취소
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-xs">정말 취소할까요?</span>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold px-3 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? '처리 중...' : '확인'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-slate-500 hover:text-slate-300 text-xs px-3 py-2 transition"
      >
        돌아가기
      </button>
    </div>
  )
}
