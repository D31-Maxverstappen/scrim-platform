'use client'

import { useEffect, useState, type CSSProperties } from 'react'

// 제목 텍스트 등장(RevealText) — 페이지 로드 시 단어 단위로 또르륵 페이드인 + 슬라이드업.
// segment.whole=true면 해당 구간은 쪼개지 않고 통째로 등장(그라데이션 텍스트 등 보존용).
// transform/opacity만 사용(GPU 가속), prefers-reduced-motion 시 즉시 표시.
// ⚠️ 신규 유저용 랜딩페이지 전용.
export type RevealSegment = {
  text: string
  className?: string
  breakAfter?: boolean // 구간 뒤 줄바꿈
  whole?: boolean // true면 단어로 쪼개지 않고 통째로 등장
}

export default function RevealText({
  segments,
  className,
  startDelay = 100,
  stagger = 55,
}: {
  segments: RevealSegment[]
  className?: string
  startDelay?: number
  stagger?: number
}) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setShown(true)
      return
    }
    const t = setTimeout(() => setShown(true), 40)
    return () => clearTimeout(t)
  }, [])

  const unitStyle = (i: number): CSSProperties => ({
    display: 'inline-block',
    whiteSpace: 'pre',
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(0.5em)',
    transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)',
    transitionDelay: `${startDelay + i * stagger}ms`,
    // 등장 후엔 레이어 힌트 해제 (영구 레이어 누적 방지)
    willChange: shown ? 'auto' : 'opacity, transform',
  })

  let idx = 0
  return (
    <span className={className}>
      {segments.map((seg, si) => {
        if (seg.whole) {
          const i = idx++
          return (
            <span key={si}>
              <span className={seg.className} style={unitStyle(i)}>
                {seg.text}
              </span>
              {seg.breakAfter && <br />}
            </span>
          )
        }
        const words = seg.text.split(' ')
        return (
          <span key={si} className={seg.className}>
            {words.map((w, wi) => {
              const i = idx++
              return (
                <span key={wi} style={unitStyle(i)}>
                  {w}
                  {wi < words.length - 1 ? ' ' : ''}
                </span>
              )
            })}
            {seg.breakAfter && <br />}
          </span>
        )
      })}
    </span>
  )
}
