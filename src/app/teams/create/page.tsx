'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    game_type: 'valorant',
    tier_avg: '',
    note: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (!user) {
      router.push('/login')
      return
    }

    // users 테이블에 유저 없으면 자동 생성
    await supabase.from('users').upsert({
      id: user.id,
      summoner_name: user.user_metadata?.full_name ?? user.email ?? '유저',
      game_type: form.game_type as 'valorant' | 'lol',
    }, { onConflict: 'id' })

    // 팀 생성
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: form.name,
        game_type: form.game_type,
        captain_id: user.id,
        tier_avg: form.tier_avg || null,
      })
      .select()
      .single()

    if (teamError) {
      setError(teamError.message.includes('unique') ? '이미 존재하는 팀 이름이에요!' : teamError.message)
      setLoading(false)
      return
    }

    // 캡틴으로 팀 멤버 등록
    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'captain',
    })

    router.push('/teams')
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

          {/* 팀 이름 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">팀 이름 *</label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="ex) Team D31"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* 게임 선택 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">게임 *</label>
            <div className="grid grid-cols-3 gap-2">
              {GAMES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm({ ...form, game_type: g.value, tier_avg: '' })}
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

          {/* 평균 티어 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">팀 평균 티어</label>
            <select
              value={form.tier_avg}
              onChange={(e) => setForm({ ...form, tier_avg: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">선택 안 함</option>
              {getTiers(form.game_type).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* 제출 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? '만드는 중...' : '팀 만들기'}
          </button>
        </form>
      </div>
    </div>
  )
}
