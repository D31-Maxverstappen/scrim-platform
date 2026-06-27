import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTierColor } from '@/lib/tiers'
import { GAME_COLOR } from '@/lib/games'
import { MOCK_MATCHES, MOCK_RANK, summarize } from '@/lib/valorantMatchMock'
import MatchRow from '@/components/match/MatchRow'

const VAL_RED = GAME_COLOR.valorant
const WIN_COLOR = '#22c55e'
const LOSS_COLOR = '#ff4655'

export default async function ValorantMatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('avatar_url, val_gamename, val_tagline, riot_gamename')
    .eq('id', user.id)
    .single()

  const valName = profile?.val_gamename ?? profile?.riot_gamename ?? null
  const valTag = profile?.val_tagline ?? null
  const connected = !!profile?.val_gamename

  const matches = MOCK_MATCHES
  const s = summarize(matches)
  const rankColor = getTierColor(MOCK_RANK.colorKey)

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">

        {/* ── 페이지 제목 + 미리보기 배지 ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: VAL_RED }} />
            <h1 className="text-white font-black text-xl tracking-tight">내 전적</h1>
          </div>
          <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
            style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.25)', color: '#E8B84B' }}>
            <span>🔶</span>
            <span><b>미리보기</b> · 라이엇 연동 시 실제 전적이 표시됩니다</span>
          </div>
        </div>

        {/* ── 플레이어 요약 헤더 ── */}
        <div className="border border-white/10 mb-6 overflow-hidden" style={{ background: `linear-gradient(135deg, ${rankColor}1f 0%, #13131f 52%)` }}>
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${rankColor}, transparent)` }} />
          <div className="px-8 py-6">
            <div className="flex items-center gap-5 mb-7 flex-wrap">
              {/* 아바타 */}
              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden flex items-center justify-center font-black text-2xl bg-[#1a1a2e] text-white" style={{ border: `2px solid ${rankColor}`, boxShadow: `0 0 18px ${rankColor}40` }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : (valName?.[0]?.toUpperCase() ?? '?')}
              </div>
              {/* 이름 + 티어 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-black text-2xl truncate">{valName ?? '플레이어'}</p>
                  {valTag && <span className="text-slate-500 text-sm">#{valTag}</span>}
                </div>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: rankColor, boxShadow: `0 0 8px ${rankColor}` }} />
                  <span className="text-base font-black" style={{ color: rankColor }}>{MOCK_RANK.name}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: `${rankColor}1a`, color: rankColor }}>{MOCK_RANK.rr} RR</span>
                </div>
              </div>
              {!connected && (
                <Link href="/onboarding?add=valorant"
                  className="text-xs font-semibold px-3 py-2 rounded transition hover:opacity-90"
                  style={{ background: 'rgba(255,70,85,0.12)', color: VAL_RED, border: '1px solid rgba(255,70,85,0.25)' }}>
                  Riot 계정 연동 →
                </Link>
              )}
            </div>

            {/* 요약 스탯 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatTile label="최근 전적" accent="#00D2BE">
                <span className="text-white">{s.wins}승</span>
                <span className="text-slate-600"> {s.losses}패</span>
              </StatTile>
              <StatTile label="승률" accent={s.winRate >= 50 ? WIN_COLOR : LOSS_COLOR}>
                <span style={{ color: s.winRate >= 50 ? WIN_COLOR : LOSS_COLOR }}>{s.winRate}%</span>
              </StatTile>
              <StatTile label="평균 ACS" accent="#00D2BE"><span className="text-white">{s.avgAcs}</span></StatTile>
              <StatTile label="K/D" accent="#00D2BE"><span className="text-white">{s.kd.toFixed(2)}</span></StatTile>
              <StatTile label="헤드샷" accent="#00D2BE"><span className="text-white">{s.hsPercent}%</span></StatTile>
            </div>

            {/* 모스트 요원 */}
            {s.topAgents.length > 0 && (
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <span className="text-slate-500 text-xs uppercase tracking-widest">모스트 요원</span>
                {s.topAgents.map((a) => (
                  <div key={a.agent} className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded px-2.5 py-1.5">
                    <span className="w-7 h-7 shrink-0 rounded bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white font-black text-xs">{a.agent[0]}</span>
                    <div className="leading-tight">
                      <p className="text-white text-xs font-bold">{a.agent}</p>
                      <p className="text-[11px]">
                        <span className="text-slate-500">{a.games}판 · </span>
                        <span className="font-bold" style={{ color: a.winRate >= 50 ? WIN_COLOR : LOSS_COLOR }}>{a.winRate}%</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 매치 목록 ── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-sm">최근 매치 <span className="text-slate-600 font-normal">({matches.length})</span></h2>
        </div>

        <div className="flex flex-col gap-2">
          {matches.map((m) => <MatchRow key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  )
}

function StatTile({ label, accent, children }: { label: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="relative bg-[#0e0e16] border border-white/5 rounded px-3 py-2.5 overflow-hidden hover:border-white/10 transition">
      <div className="absolute top-0 left-0 h-0.5 w-full opacity-70" style={{ background: accent ?? 'rgba(255,255,255,0.12)' }} />
      <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-1 mt-0.5">{label}</p>
      <p className="text-lg font-black">{children}</p>
    </div>
  )
}

