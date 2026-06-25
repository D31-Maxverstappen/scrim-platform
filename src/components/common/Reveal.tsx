'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Direction = 'up' | 'left' | 'right'

// 스크롤/로드 등장(Reveal) — 페이드인 + 슬라이드(+선택적 스케일).
// IntersectionObserver + CSS transition만 사용 → 경량·GPU 가속(transform/opacity)으로 모바일에서도 버벅임 없음.
// 한 번 나타난 요소는 다시 숨기지 않음(once). prefers-reduced-motion 사용자는 애니메이션 없이 즉시 표시.
// ⚠️ 신규 유저용 랜딩페이지 전용. 로그인 후 메인/내부 페이지에는 사용하지 않는다.
//
// props
//  - trigger: 'view'(뷰포트 진입 시, 기본) | 'load'(페이지 로드 시) — 히어로처럼 처음부터 보이는 영역은 'load'
//  - direction: 'up'(기본) | 'left' | 'right' — 등장 방향
//  - scale: true면 살짝 확대되며 등장("화라락" 느낌)
//  - distance: 슬라이드 거리(px, 기본 24)
//  - delay: 등장 지연(ms) — 스태거에 사용
export default function Reveal({
  children,
  delay = 0,
  className,
  trigger = 'view',
  direction = 'up',
  scale = false,
  distance = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  trigger?: 'view' | 'load'
  direction?: Direction
  scale?: boolean
  distance?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setShown(true)
      return
    }
    if (trigger === 'load') {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
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
  }, [trigger])

  const hidden = [
    direction === 'up' ? `translateY(${distance}px)` : '',
    direction === 'left' ? `translateX(-${distance}px)` : '',
    direction === 'right' ? `translateX(${distance}px)` : '',
    scale ? 'scale(0.96)' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : hidden,
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
