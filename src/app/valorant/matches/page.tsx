import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import { getTierColor } from '@/lib/tiers'
import { GAME_COLOR } from '@/lib/games'
import { MOCK_MATCHES, MOCK_RANK, summarize, type ValMatch } from '@/lib/valorantMatchMock'

const VAL_RED = GAME_COLOR.valorant
const WIN_COLOR = '#22c55e'
const LOSS_COLOR = '#ff4655'

const MODE_LABEL_COLOR: Record<string, string> = {
  경쟁전: '#E8B84B',
  스크림: '#00D2BE',
  일반전: '#94a3b8',
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

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
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">

        {/* ── 페이지 제목 + 미리보기 배지 ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: VAL_RED }} />
            <h1 className="text-white font-black text-xl tracking-tight">발로란트 전적</h1>
          </div>
          <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
            style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.25)', color: '#E8B84B' }}>
            <span>🔶</span>
            <span><b>미리보기</b> · 라이엇 연동 시 실제 전적이 표시됩니다</span>
          </div>
        </div>

        {/* ── 플레이어 요약 헤더 ── */}
        <div className="border border-white/10 bg-[#13131f] mb-6 overflow-hidden">
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${VAL_RED}, transparent)` }} />
          <div className="px-8 py-6">
            <div className="flex items-center gap-5 mb-7 flex-wrap">
              {/* 아바타 */}
              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden flex items-center justify-center font-black text-2xl border border-white/10 bg-[#1a1a2e] text-white">
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
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-bold" style={{ color: rankColor }}>{MOCK_RANK.name}</span>
                  <span className="text-slate-600 text-xs">· {MOCK_RANK.rr} RR</span>
                </div>
              </div>
              {!connected && (
                <Link href="/onboarding?add=valorant"
                  className="text-xs font-semibold px-3 py-2 rounded transition hover:opacity-90"
                  style={{ background: 'rgba(255,70,85,0.12)', color: VAL_RED, border: '1px solid rgba(255,70,85,0.25)' }}>
                  VALORANT 계정 연동 →
                </Link>
              )}
            </div>

            {/* 요약 스탯 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatTile label="최근 전적">
                <span className="text-white">{s.wins}승</span>
                <span className="text-slate-600"> {s.losses}패</span>
              </StatTile>
              <StatTile label="승률">
                <span style={{ color: s.winRate >= 50 ? WIN_COLOR : LOSS_COLOR }}>{s.winRate}%</span>
              </StatTile>
              <StatTile label="평균 ACS"><span className="text-white">{s.avgAcs}</span></StatTile>
              <StatTile label="K/D"><span className="text-white">{s.kd.toFixed(2)}</span></StatTile>
              <StatTile label="헤드샷"><span className="text-white">{s.hsPercent}%</span></StatTile>
            </div>

            {/* 모스트 요원 */}
            {s.topAgents.length > 0 && (
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <span className="text-slate-500 text-xs uppercase tracking-widest mr-1">모스트 요원</span>
                {s.topAgents.map((a) => (
                  <span key={a.agent} className="flex items-center gap-1.5 bg-white/5 rounded px-2.5 py-1 text-xs">
                    <span className="text-white font-semibold">{a.agent}</span>
                    <span className="text-slate-500">{a.games}판</span>
                    <span style={{ color: a.winRate >= 50 ? WIN_COLOR : LOSS_COLOR }}>{a.winRate}%</span>
                  </span>
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

        {/* 라이엇 디스클레이머 */}
        <p className="text-slate-600 text-[11px] mt-8 leading-relaxed">
          D31.GG는 Riot Games의 검수를 받거나 보증·후원받은 서비스가 아니며, Riot Games 또는 발로란트 제작·관리에 공식적으로 관여하는
          누구의 견해도 반영하지 않습니다. VALORANT 및 관련 자산은 Riot Games, Inc.의 상표 또는 등록상표입니다.
        </p>
      </div>
    </div>
  )
}

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0e0e16] border border-white/5 rounded px-3 py-2.5">
      <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black">{children}</p>
    </div>
  )
}

function MatchRow({ m }: { m: ValMatch }) {
  const accent = m.win ? WIN_COLOR : LOSS_COLOR
  const kda = ((m.kills + m.assists) / (m.deaths || 1)).toFixed(2)
  return (
    <div className="flex items-stretch bg-[#13131f] border border-white/5 rounded overflow-hidden hover:border-white/15 transition">
      {/* 승패 색상 바 */}
      <div className="w-1 shrink-0" style={{ background: accent }} />

      <div className="flex-1 flex items-center gap-4 px-4 py-3 flex-wrap sm:flex-nowrap">
        {/* 결과 + 모드 */}
        <div className="w-20 shrink-0">
          <p className="font-black text-sm" style={{ color: accent }}>{m.win ? '승리' : '패배'}</p>
          <p className="text-[11px] mt-0.5" style={{ color: MODE_LABEL_COLOR[m.mode] ?? '#94a3b8' }}>{m.mode}</p>
        </div>

        {/* 요원 + 맵 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 shrink-0 rounded bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white font-black text-sm">
            {m.agent[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{m.agent}</p>
            <p className="text-slate-500 text-xs truncate">{m.map} · {m.agentRole}</p>
          </div>
          {m.mvp && (
            <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(232,184,75,0.15)', color: '#E8B84B' }}>MVP</span>
          )}
        </div>

        {/* 스코어 */}
        <div className="text-center shrink-0 w-16">
          <p className="text-sm font-black">
            <span style={{ color: m.win ? WIN_COLOR : '#cbd5e1' }}>{m.roundsWon}</span>
            <span className="text-slate-600"> : </span>
            <span style={{ color: !m.win ? LOSS_COLOR : '#cbd5e1' }}>{m.roundsLost}</span>
          </p>
          <p className="text-slate-600 text-[10px] mt-0.5">스코어</p>
        </div>

        {/* KDA */}
        <div className="text-center shrink-0 w-24">
          <p className="text-white text-sm font-bold">
            {m.kills} <span className="text-slate-600">/</span> <span className="text-[#ff6b76]">{m.deaths}</span> <span className="text-slate-600">/</span> {m.assists}
          </p>
          <p className="text-slate-600 text-[10px] mt-0.5">{kda} KDA</p>
        </div>

        {/* ACS / HS */}
        <div className="text-center shrink-0 w-16 hidden sm:block">
          <p className="text-white text-sm font-bold">{m.acs}</p>
          <p className="text-slate-600 text-[10px] mt-0.5">ACS</p>
        </div>
        <div className="text-center shrink-0 w-14 hidden sm:block">
          <p className="text-white text-sm font-bold">{m.hsPercent}%</p>
          <p className="text-slate-600 text-[10px] mt-0.5">HS</p>
        </div>

        {/* 날짜 */}
        <div className="text-right shrink-0 w-28 hidden md:block">
          <p className="text-slate-400 text-xs">{fmtDate(m.playedAt)}</p>
          <p className="text-slate-600 text-[10px] mt-0.5">{m.durationMin}분</p>
        </div>
      </div>
    </div>
  )
}
