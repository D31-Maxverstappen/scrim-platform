'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  type: 'scrim_post' | 'team'
  id: string
  initial: boolean
  /** icon = 아이콘만, full = 아이콘+텍스트 */
  variant?: 'icon' | 'full'
  /** 토글 후 목록 갱신이 필요한 페이지(즐겨찾기 페이지 등)에서 true */
  refreshOnToggle?: boolean
}

export default function BookmarkButton({ type, id, initial, variant = 'icon', refreshOnToggle = false }: Props) {
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(initial)
  const [loading, setLoading] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const prev = bookmarked
    setBookmarked(!prev) // 낙관적 업데이트
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
    setLoading(false)
    if (!res.ok) {
      setBookmarked(prev) // 실패 시 롤백
      return
    }
    const data = await res.json()
    setBookmarked(data.bookmarked)
    if (refreshOnToggle) router.refresh()
  }

  const Icon = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4V5z" />
    </svg>
  )

  if (variant === 'full') {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        aria-pressed={bookmarked}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition disabled:opacity-50 ${
          bookmarked
            ? 'border-[#00D2BE]/50 text-[#00D2BE] bg-[#00D2BE]/10'
            : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
        }`}
      >
        {Icon}
        {bookmarked ? '저장됨' : '즐겨찾기'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
      className={`p-1.5 rounded transition disabled:opacity-50 ${
        bookmarked ? 'text-[#00D2BE]' : 'text-slate-500 hover:text-white'
      }`}
    >
      {Icon}
    </button>
  )
}
