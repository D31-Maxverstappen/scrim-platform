'use client'

import { Fragment, useState } from 'react'

type Step = {
  id: string
  label: string
  done: boolean
  href: string
  cta: string
}

export default function OnboardingBar({ steps }: { steps: Step[] }) {
  const [dismissed, setDismissed] = useState(false)
  const allDone = steps.every((s) => s.done)

  if (dismissed || allDone) return null

  const doneCount = steps.filter((s) => s.done).length
  const currentIdx = steps.findIndex((s) => !s.done)

  return (
    <div className="sticky top-0 z-40 backdrop-blur-sm border-b" style={{ background: 'var(--navbar-bg)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">

        {/* 진행도 */}
        <span className="text-xs font-black text-slate-400 shrink-0 tabular-nums mr-6">
          {doneCount}<span className="text-slate-500">/{steps.length}</span>
        </span>

        {/* 스텝 영역 - flex-1로 감싸서 선 비율 균등하게 */}
        <div className="flex-1 flex items-center">
          {steps.map((step, i) => (
            <Fragment key={step.id}>
              {i > 0 && (
                <div className={`flex-1 h-px mx-4 ${steps[i - 1].done ? 'bg-[#00D2BE]/40' : ''}`}
                  style={steps[i - 1].done ? {} : { background: 'var(--border-input)' }} />
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 원 */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  step.done
                    ? 'bg-[#00D2BE] border-[#00D2BE]'
                    : i === currentIdx
                    ? 'border-[#00D2BE]/60 bg-[#00D2BE]/08'
                    : ''
                }`} style={!step.done && i !== currentIdx ? { borderColor: 'var(--border-input)' } : {}}>
                  {step.done ? (
                    <svg className="w-2 h-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-[9px] font-black leading-none ${i === currentIdx ? 'text-[#00D2BE]' : 'text-slate-500'}`}>{i + 1}</span>
                  )}
                </div>

                {/* 라벨 */}
                <span className={`text-xs font-bold ${
                  step.done
                    ? 'text-slate-500'
                    : i === currentIdx
                    ? 'text-white'
                    : 'text-slate-400'
                }`}>
                  {step.label}
                </span>

                {/* 현재 단계 CTA */}
                {!step.done && i === currentIdx && (
                  <a href={step.href} className="text-xs text-[#00D2BE] font-bold hover:underline ml-1 shrink-0">
                    {step.cta} →
                  </a>
                )}
              </div>
            </Fragment>
          ))}
        </div>

        {/* 닫기 - 스텝 영역 밖, 완전 분리 */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 ml-6 text-slate-500 hover:text-slate-300 transition text-base leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  )
}
