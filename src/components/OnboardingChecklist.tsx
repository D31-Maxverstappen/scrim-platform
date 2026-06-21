'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

type Step = {
  id: string
  label: string
  desc: string
  done: boolean
  href: string
  cta: string
}

export default function OnboardingChecklist({ steps }: { steps: Step[] }) {
  const { lang } = useLang()
  const [dismissed, setDismissed] = useState(false)
  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  if (dismissed || allDone) return null

  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden mb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-white text-xs font-bold">{t('guide_title', lang)}</span>
          <span className="text-[#00D2BE] text-xs font-black">{doneCount}/{steps.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* 진행 바 */}
          <div className="w-24 bg-white/5 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-[#00D2BE] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <button onClick={() => setDismissed(true)} className="text-slate-600 hover:text-slate-400 transition text-lg leading-none">×</button>
        </div>
      </div>

      {/* 스텝 목록 */}
      <div className="divide-y divide-white/5">
        {steps.map((s) => (
          <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 ${s.done ? 'opacity-50' : ''}`}>
            {/* 체크 */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition
              ${s.done ? 'border-[#00D2BE] bg-[#00D2BE]' : 'border-white/20'}`}>
              {s.done && (
                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${s.done ? 'text-slate-500 line-through' : 'text-white'}`}>{s.label}</p>
              {!s.done && <p className="text-slate-600 text-xs mt-0.5">{s.desc}</p>}
            </div>

            {/* 액션 */}
            {!s.done && (
              <a href={s.href}
                className="text-[#00D2BE] text-xs font-bold hover:underline shrink-0">
                {s.cta} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
