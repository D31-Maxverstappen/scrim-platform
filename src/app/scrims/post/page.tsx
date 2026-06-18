'use client'

import { useState, useTransition } from 'react'
import { createScrimAction } from '@/app/actions'

const GAMES = [
  { value: 'valorant', label: 'VALORANT' },
  { value: 'lol', label: 'League of Legends' },
]

export default function PostScrimPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [game, setGame] = useState('valorant')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('game_type', game)

    startTransition(async () => {
      const result = await createScrimAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <a href="/scrims" className="text-slate-500 text-sm hover:text-slate-300 transition">← 뒤로</a>
          <h1 className="text-white font-bold text-2xl mt-3">스크림 올리기</h1>
          <p className="text-slate-400 text-sm mt-1">상대 팀을 모집하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">

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
                      ? 'bg-[#00D2BE] text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 날짜</label>
            <input
              name="preferred_date"
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D2BE] transition"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 시간</label>
            <input
              name="preferred_time"
              type="time"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D2BE] transition"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">한마디</label>
            <textarea
              name="note"
              rows={3}
              placeholder="ex) Silver~Gold team wanted. Discord required!"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {isPending ? '올리는 중...' : '스크림 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}
