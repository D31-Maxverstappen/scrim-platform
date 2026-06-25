import type { ReactNode } from 'react'

// 빈 상태(empty state)용 브랜드 아이콘 모음 — OS마다 다른 이모지(🎮) 대체
export const EmptyIcons = {
  swords: (
    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M14 7h3v3M17 17 7 7M10 7H7v3" />
    </svg>
  ),
  megaphone: (
    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 11 18-5v12L3 14v-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  search: (
    <svg width="30" height="30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  ),
  target: (
    <svg width="30" height="30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  ),
}

// 공통 빈 상태 컴포넌트 — 아이콘(원형 글로우 배경) + 제목 + 설명 + 선택적 CTA
export function EmptyState({
  icon,
  title,
  description,
  action,
  accent = '#ff4655',
}: {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  accent?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#13131f] border border-white/5 rounded">
      <div className="relative w-[88px] h-[88px] mb-5 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${accent}2e, transparent 70%)` }}
        />
        <div
          className="relative w-[68px] h-[68px] rounded-full bg-[#0a0a0a] flex items-center justify-center"
          style={{ border: `1px solid ${accent}4d`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="text-slate-100 font-semibold text-base mb-1.5">{title}</p>
      {description && <div className="text-slate-500 text-sm leading-relaxed">{description}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
