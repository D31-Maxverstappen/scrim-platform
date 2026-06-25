'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// 스크롤 등장(Scroll Reveal) — 뷰포트 진입 시 1회만 페이드인 + 슬라이드업(24px).
// IntersectionObserver + CSS transition만 사용 → 경량·GPU 가속(transform/opacity)으로 모바일에서도 버벅임 없음.
// 한 번 나타난 요소는 다시 숨기지 않음(once). prefers-reduced-motion 사용자는 애니메이션 없이 즉시 표시.
// ⚠️ 신규 유저용 랜딩페이지 전용. 로그인 후 메인/내부 페이지에는 사용하지 않는다.
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setShown(true)
          obs.disconnect() // once — 한 번 노출 후 관찰 해제
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(24px)',
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
