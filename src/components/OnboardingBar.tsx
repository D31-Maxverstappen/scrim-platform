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
    <div className="sticky top-16 z-40 bg-[#070711]/98 backdrop-blur-sm border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 h-11 flex items-center gap-0">

        {/* 진행도 */}
        <span className="text-[10px] font-black text-slate-700 mr-5 shrink-0 tabular-nums">
          {doneCount}<span className="text-slate-800">/{steps.length}</span>
        </span>

        {/* 스텝 */}
        {steps.map((step, i) => (
          <Fragment key={step.id}>
            {i > 0 && (
              <div className={`w-10 h-px mx-3 shrink-0 ${steps[i - 1].done ? 'bg-[#00D2BE]/40' : 'bg-white/[0.07]'}`} />
            )}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* 원 */}
              <div className={`w-[17px] h-[17px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                step.done
                  ? 'bg-[#00D2BE] border-[#00D2BE]'
                  : i === currentIdx
                  ? 'border-[#00D2BE]/60 bg-[#00D2BE]/08'
                  : 'border-white/[0.1]'
              }`}>
                {step.done ? (
                  <svg className="w-2 h-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-[9px] font-black leading-none ${i === currentIdx ? 'text-[#00D2BE]' : 'text-slate-700'}`}>{i + 1}</span>
                )}
              </div>

              {/* 라벨 */}
              <span className={`text-[11px] font-bold ${
                step.done
                  ? 'text-slate-700 line-through decoration-slate-800'
                  : i === currentIdx
                  ? 'text-white'
                  : 'text-slate-600'
              }`}>
                {step.label}
              </span>

              {/* 현재 단계 CTA */}
              {!step.done && i === currentIdx && (
                <a href={step.href} className="text-[10px] text-[#00D2BE] font-bold hover:underline ml-1 shrink-0">
                  {step.cta} →
                </a>
              )}
            </div>
          </Fragment>
        ))}

        {/* 닫기 */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto text-slate-800 hover:text-slate-500 transition text-base leading-none shrink-0"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  )
}
