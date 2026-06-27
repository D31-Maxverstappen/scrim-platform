'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function AppealForm() {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (reason.trim().length < 20) {
      setErrorMsg('사유를 20자 이상 작성해주세요.')
      setState('error')
      return
    }

    setState('loading')
    setErrorMsg('')

    const res = await fetch('/api/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() }),
    })
    const data = await res.json()

    if (res.ok) {
      setState('success')
    } else {
      setErrorMsg(data.error ?? '오류가 발생했습니다. 다시 시도해주세요.')
      setState('error')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-300 transition"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        이의 신청하기
      </button>
    )
  }

  if (state === 'success') {
    return (
      <div className="w-full rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-green-400 font-bold text-sm mb-1">이의 신청이 접수되었습니다</p>
        <p className="text-slate-500 text-xs leading-relaxed">
          검토 후 72시간 내 답변 드립니다.<br />
          처리 결과는 디스코드를 통해 안내드릴 예정입니다.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl p-5 flex flex-col gap-3 text-left" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div>
        <p className="text-white text-sm font-bold mb-1">이의 신청</p>
        <p className="text-slate-500 text-xs leading-relaxed">
          정지 처리에 이의가 있으신 경우 사유를 작성해 주세요.
        </p>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="정지 처리에 동의하지 않는 이유를 상세히 작성해 주세요. (최소 20자)"
        rows={4}
        className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
      />

      <span className={`text-[11px] ${reason.length >= 20 ? 'text-slate-600' : 'text-slate-700'}`}>
        {reason.length} / 20자 이상
      </span>

      {state === 'error' && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={state === 'loading'}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition disabled:opacity-50"
          style={{ backgroundColor: '#00D2BE' }}>
          {state === 'loading' ? '제출 중...' : '이의 신청 제출'}
        </button>
        <button
          onClick={() => { setOpen(false); setState('idle'); setErrorMsg('') }}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-300 transition"
          style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}>
          취소
        </button>
      </div>
    </div>
  )
}
