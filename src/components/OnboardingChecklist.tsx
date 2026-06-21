'use client'

import { useState } from 'react'

type Step = {
  id: string
  label: string
  desc: string
  done: boolean
  href: string
  cta: string
}

export default function OnboardingChecklist({ steps }: { steps: Step[] }) {
  const [dismissed, setDismissed] = useState(false)
  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  if (dismissed || allDone) return null

  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">시작 가이드</p>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-white/[0.05] rounded-full h-1">
              <div
                className="h-1 rounded-full bg-gradient-to-r from-[#00D2BE] to-[#00edd6] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-[#00D2BE]">{doneCount}/{steps.length}</span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-700 hover:text-slate-500 transition text-lg leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* 스텝 */}
      <div className="divide-y divide-white/[0.04]">
        {steps.map((s) => (
          <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 ${s.done ? 'opacity-40' : ''}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
              s.done ? 'border-[#00D2BE] bg-[#00D2BE]' : 'border-white/[0.15]'
            }`}>
              {s.done && (
                <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${s.done ? 'text-slate-600 line-through' : 'text-white'}`}>{s.label}</p>
              {!s.done && <p className="text-slate-600 text-[10px] mt-0.5">{s.desc}</p>}
            </div>
            {!s.done && (
              <a href={s.href} className="text-[#00D2BE] text-[10px] font-bold hover:underline shrink-0">
                {s.cta} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
