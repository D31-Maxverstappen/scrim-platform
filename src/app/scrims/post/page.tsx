'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const GAMES = [
  { value: 'valorant', label: '발로란트' },
  { value: 'lol', label: '리그 오브 레전드' },
  { value: 'overwatch', label: '오버워치 2' },
]

export default function PostScrimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    game_type: 'valorant',
    preferred_date: '',
    preferred_time: '',
    note: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // 내 팀 찾기
    const { data: myTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('captain_id', user.id)
      .eq('game_type', form.game_type)
      .single()

    if (!myTeam) {
      setError('해당 게임의 팀이 없어요. 먼저 팀을 만들어주세요!')
      setLoading(false)
      return
    }

    const preferredDate = form.preferred_date && form.preferred_time
      ? `${form.preferred_date}T${form.preferred_time}:00`
      : null

    const { error: postError } = await supabase
      .from('scrim_posts')
      .insert({
        team_id: myTeam.id,
        game_type: form.game_type,
        preferred_date: preferredDate,
        note: form.note || null,
        status: 'open',
      })

    if (postError) {
      setError(postError.message)
      setLoading(false)
      return
    }

    router.push('/scrims')
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

          {/* 게임 선택 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">게임 *</label>
            <div className="grid grid-cols-3 gap-2">
              {GAMES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm({ ...form, game_type: g.value })}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    form.game_type === g.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 날짜</label>
            <input
              type="date"
              value={form.preferred_date}
              onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* 시간 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 시간</label>
            <input
              type="time"
              value={form.preferred_time}
              onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">한마디</label>
            <textarea
              rows={3}
              placeholder="ex) 실버~골드 팀 구합니다. 디스코드 필참!"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? '올리는 중...' : '스크림 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}
