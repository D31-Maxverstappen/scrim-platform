'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteAccountButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch('/api/users/delete', { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      alert(data.error ?? '탈퇴 실패')
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">정말 탈퇴할까요?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 rounded"
        >
          {loading ? '...' : '탈퇴'}
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
      className="text-xs font-bold px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition rounded"
    >
      탈퇴하기
    </button>
  )
}
