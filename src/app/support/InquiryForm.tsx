'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SUBJECTS = [
  '계정 문의',
  '팀 / 스크림 문의',
  '버그 신고',
  '기타',
]

export default function InquiryForm({ displayName }: { displayName: string }) {
  const router = useRouter()
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [content, setContent] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length < 10) return
    setState('loading')

    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, content: content.trim() }),
    })

    setState(res.ok ? 'done' : 'error')
    if (res.ok) router.refresh()  // 옆 '내 문의 내역'(서버컴포넌트) 즉시 갱신
  }

  if (state === 'done') {
    return (
      <div className="py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#00D2BE]/10 border border-[#00D2BE]/30 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-[#00D2BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-bold text-lg">문의가 접수되었습니다</p>
        <p className="text-slate-500 text-sm mt-2">확인 후 빠르게 처리해 드릴게요, {displayName}님</p>
        <button
          onClick={() => { setContent(''); setState('idle') }}
          className="mt-6 text-xs text-slate-500 hover:text-white transition"
        >
          추가 문의하기 →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 카테고리 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">문의 유형</label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                subject === s
                  ? 'bg-[#00D2BE] text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">문의 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="문의 내용을 자세히 적어주세요 (최소 10자)"
          rows={6}
          className="w-full bg-[#13131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE]/50 transition resize-none"
        />
        <p className="text-right text-slate-700 text-[11px] mt-1">{content.length}자</p>
      </div>

      {state === 'error' && (
        <p className="text-red-400 text-xs">오류가 발생했습니다. 다시 시도해 주세요.</p>
      )}

      <button
        type="submit"
        disabled={content.trim().length < 10 || state === 'loading'}
        className="w-full py-3 rounded-xl text-sm font-bold bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
      >
        {state === 'loading' ? '제출 중...' : '문의 제출'}
      </button>
    </form>
  )
}
