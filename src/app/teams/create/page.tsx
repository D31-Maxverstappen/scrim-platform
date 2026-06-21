'use client'

import { useState, useTransition } from 'react'
import { createTeamAction } from '@/app/actions'

export default function CreateTeamPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const game = 'valorant'
  const [name, setName] = useState('')
  const [abbr, setAbbr] = useState('')

  const nameEnglishOnly = /^[a-zA-Z0-9 _\-\.]+$/.test(name)
  const nameValid = name.length >= 3 && name.length <= 10 && nameEnglishOnly
  const abbrValid = abbr.length >= 2 && abbr.length <= 5

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nameEnglishOnly) { setError('팀 이름은 영어만 입력 가능해요.'); return }
    if (!nameValid) { setError('팀 이름은 3~10글자여야 해요.'); return }
    if (!abbrValid) { setError('팀 약자는 2~5글자여야 해요. (예: PRX, T1, GEN)'); return }
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('game_type', game)

    startTransition(async () => {
      const result = await createTeamAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <a href="/teams" className="text-slate-500 text-sm hover:text-slate-300 transition">← 뒤로</a>
          <h1 className="text-white font-bold text-2xl mt-3">팀 만들기</h1>
          <p className="text-slate-400 text-sm mt-1">팀을 만들고 스크림을 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 p-6 flex flex-col gap-5">

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 text-sm font-semibold">팀 이름 *</label>
              <span className={`text-xs ${name.length > 10 ? 'text-red-400' : name.length >= 3 ? 'text-[#00D2BE]' : 'text-slate-600'}`}>
                {name.length} / 10
              </span>
            </div>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              placeholder="팀 풀네임 (3~10글자)"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition"
            />
            {name.length > 0 && !nameEnglishOnly && (
              <p className="text-red-400 text-xs mt-1">영어만 입력 가능해요</p>
            )}
            {name.length > 0 && nameEnglishOnly && name.length < 3 && (
              <p className="text-slate-600 text-xs mt-1">최소 3글자 이상 입력해주세요</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 text-sm font-semibold">팀 약자 *</label>
              <span className={`text-xs ${abbr.length > 5 ? 'text-red-400' : abbrValid ? 'text-[#00D2BE]' : 'text-slate-600'}`}>
                {abbr.length} / 5
              </span>
            </div>
            <input
              name="abbreviation"
              type="text"
              required
              value={abbr}
              onChange={(e) => setAbbr(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="예: PRX, T1, GEN"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition font-bold tracking-widest"
            />
            <p className="text-slate-600 text-xs mt-1">Discord 스크림 채널명에 사용돼요</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !nameValid || !abbrValid}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 transition"
          >
            {isPending ? '만드는 중...' : '팀 만들기'}
          </button>
        </form>
      </div>
    </div>
  )
}
