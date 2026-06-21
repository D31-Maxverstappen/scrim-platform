'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

const VAL_ROLES = ['Duelist', 'Initiator', 'Sentinel', 'Controller', 'IGL', 'Flex']

const VAL_TIERS = [
  'Iron 3', 'Iron 2', 'Iron 1',
  'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 3', 'Silver 2', 'Silver 1',
  'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 3', 'Platinum 2', 'Platinum 1',
  'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Ascendant 3', 'Ascendant 2', 'Ascendant 1',
  'Immortal 3', 'Immortal 2', 'Immortal 1',
  'Radiant',
]

function RecruitPostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') === 'lfp' ? 'lfp' : 'lft'

  const [type, setType] = useState<'lft' | 'lfp'>(defaultType)
  const game = 'valorant'
  const [tier, setTier] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [discordTag, setDiscordTag] = useState('')
  const [myTeam, setMyTeam] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('val_tier, tier, discord_tag').eq('id', user.id).single()
        .then(({ data: profile }) => {
          if (profile?.discord_tag) setDiscordTag(profile.discord_tag)
          if (type === 'lft') {
            const t = profile?.val_tier ?? null
            if (t) setTier(t)
          }
        })
      supabase.from('teams').select('id, name, tier_avg, game_type').eq('captain_id', user.id).eq('game_type', game).single()
        .then(({ data }) => setMyTeam(data))
    })
  }, [game])

  const toggleRole = (r: string) => {
    setRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (type === 'lfp' && !myTeam) { setError('해당 게임의 팀 캡틴이 아니에요.'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/recruit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, game_type: game, tier: tier || null,
        roles: roles.length ? roles : null,
        note: note || null,
        discord_tag: discordTag || null,
        team_id: type === 'lfp' ? myTeam?.id : null,
      }),
    })
    setLoading(false)
    if (res.ok) router.push(`/recruit?type=${type}`)
    else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했어요.')
    }
  }

  const roleList = VAL_ROLES
  const tierList = VAL_TIERS

  const chipCls = (active: boolean) =>
    `px-2.5 py-1 rounded text-xs font-semibold transition ${active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <a href="/recruit" className="text-slate-500 text-sm hover:text-slate-300 transition">← 모집 게시판</a>
          <h1 className="text-white font-bold text-2xl mt-3">모집 글 올리기</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 rounded p-6 flex flex-col gap-5">

          {/* LFT / LFP */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">유형 *</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setType('lft'); setRoles([]) }}
                className={`py-3 rounded text-sm font-bold transition flex flex-col items-center gap-0.5 ${type === 'lft' ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                LFT
                <span className="text-[10px] opacity-70 font-normal">팀 구함</span>
              </button>
              <button type="button" onClick={() => { setType('lfp'); setRoles([]) }}
                className={`py-3 rounded text-sm font-bold transition flex flex-col items-center gap-0.5 ${type === 'lfp' ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                LFP
                <span className="text-[10px] opacity-70 font-normal">선수 구함</span>
              </button>
            </div>
          </div>

          {/* LFP일 때 내 팀 표시 */}
          {type === 'lfp' && (
            <div className="bg-white/3 border border-white/5 rounded px-4 py-3">
              {myTeam ? (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">모집하는 팀</p>
                  <p className="text-white font-bold text-sm">{myTeam.name}</p>
                  {myTeam.tier_avg && <p className="text-slate-400 text-xs">Avg. {myTeam.tier_avg}</p>}
                </div>
              ) : (
                <p className="text-red-400 text-xs">이 게임의 팀 캡틴이어야 선수 모집을 올릴 수 있어요.</p>
              )}
            </div>
          )}

          {/* 포지션/역할 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              {type === 'lft' ? '내 포지션' : '모집 포지션'} <span className="text-slate-500 font-normal">(복수 선택)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {roleList.map((r) => (
                <button key={r} type="button" onClick={() => toggleRole(r)} className={chipCls(roles.includes(r))}>{r}</button>
              ))}
            </div>
          </div>

          {/* 티어 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              {type === 'lft' ? '내 티어' : '희망 티어'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tierList.map((t) => (
                <button key={t} type="button" onClick={() => setTier(tier === t ? '' : t)} className={chipCls(tier === t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* 한마디 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">한마디</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder={type === 'lft' ? '스크림 가능 시간, 원하는 팀 분위기 등...' : '팀 소개, 연습 일정 등...'}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition resize-none"
            />
          </div>

          {/* Discord */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">Discord 태그</label>
            <input
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
              placeholder="예: username#1234 또는 username"
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading || (type === 'lfp' && !myTeam)}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 rounded transition">
            {loading ? '올리는 중...' : '올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function RecruitPostPage() {
  return (
    <Suspense>
      <RecruitPostContent />
    </Suspense>
  )
}
