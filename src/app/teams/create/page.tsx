'use client'

import { useState, useTransition } from 'react'
import { createTeamAction } from '@/app/actions'

const GAMES = [
  { value: 'valorant',  label: '발로란트' },
  { value: 'lol',       label: '리그 오브 레전드' },
  { value: 'overwatch', label: '오버워치 2' },
]

const TIERS_VAL = ['아이언', '브론즈', '실버', '골드', '플래티넘', '다이아', '어센던트', '이모탈', '레디언트']
const TIERS_LOL = ['아이언', '브론즈', '실버', '골드', '플래티넘', '에메랄드', '다이아', '마스터', '그랜드마스터', '챌린저']
const TIERS_OW  = ['브론즈', '실버', '골드', '플래티넘', '다이아', '마스터', '그랜드마스터', 'TOP 500']

function getTiers(game: string) {
  if (game === 'lol') return TIERS_LOL
  if (game === 'overwatch') return TIERS_OW
  return TIERS_VAL
}

export default function CreateTeamPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [game, setGame] = useState('valorant')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">

          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">팀 이름 *</label>
            <input
              name="name"
              type="text"
              required
              maxLength={20}
              placeholder="ex) Team D31"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">게임 *</label>
            <div className="grid grid-cols-3 gap-2">
              {GAMES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGame(g.value)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    game === g.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">팀 평균 티어</label>
            <select
              name="tier_avg"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">선택 안 함</option>
              {getTiers(game).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {isPending ? '만드는 중...' : '팀 만들기'}
          </button>
        </form>
      </div>
    </div>
  )
}
