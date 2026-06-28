'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCareerAction } from '@/app/actions'

export default function CareerEditor({ initial }: { initial: string | null }) {
  const router = useRouter()
  const [value, setValue] = useState(initial ?? '')
  const [editing, setEditing] = useState(false)
  const [pending, start] = useTransition()

  const save = () => start(async () => {
    await updateCareerAction(value)
    setEditing(false)
    router.refresh()
  })

  if (editing) {
    return (
      <div className="bg-[#111118] border border-white/5 rounded p-5">
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">경력</p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="예) OO팀 IGL (2024), 챌린저스 코리아 8강, 듀오랭 불멸 달성 등 자유롭게 적어주세요"
          className="w-full bg-[#0d0d18] border border-white/10 rounded px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE]/50 transition resize-none"
        />
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-slate-600 text-[11px] mr-auto">{value.length} / 1000</span>
          <button onClick={() => { setValue(initial ?? ''); setEditing(false) }}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition">취소</button>
          <button onClick={save} disabled={pending}
            className="text-xs font-bold bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-40 text-white px-4 py-1.5 rounded transition">
            {pending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111118] border border-white/5 rounded p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-500 text-xs uppercase tracking-widest">경력</p>
        <button onClick={() => setEditing(true)} className="text-xs text-[#00D2BE] hover:underline">
          {value ? '수정' : '+ 등록'}
        </button>
      </div>
      {value
        ? <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{value}</p>
        : <p className="text-slate-600 text-sm">아직 등록한 경력이 없어요. 등록하면 내 프로필에 표시돼요.</p>}
    </div>
  )
}
