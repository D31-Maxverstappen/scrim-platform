'use client'

import { useEffect, useState } from 'react'

// 스크롤 유도 큐 — 히어로 하단의 "자세히 보기 + 통통 튀는 화살표".
// 사용자가 스크롤을 시작하면(=역할 종료) 부드럽게 페이드아웃, 맨 위로 돌아오면 다시 등장.
// ⚠️ 신규 유저용 랜딩페이지 전용.
export default function ScrollCue({
  href = '#features',
  label = '자세히 보기',
}: {
  href?: string
  label?: string
}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={href}
      aria-hidden={hidden}
      className={`mt-8 flex flex-col items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 group ${
        hidden ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100'
      }`}
    >
      <span className="text-sm font-semibold tracking-widest uppercase">{label}</span>
      <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#00D2BE]/60 flex items-center justify-center transition animate-bounce">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </a>
  )
}
