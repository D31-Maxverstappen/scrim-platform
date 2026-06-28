import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FlagImg } from '@/components/common/CountrySelect'
import InviteButton from '@/components/team/InviteButton'
import { GAME_LABEL, GAME_COLOR } from '@/lib/games'

const ROLE_LABEL: Record<string, string> = {
  captain: '주장', igl: 'IGL', player: '선수', head_coach: '헤드 코치', coach: '코치',
}
const ROLE_COLOR: Record<string, string> = {
  captain: '#00D2BE', igl: '#f59e0b', player: '#94a3b8', head_coach: '#a78bfa', coach: '#60a5fa',
}

type TeamRow = { id: string; name: string; game_type: string; tier_avg: string | null; wins: number | null; losses: number | null }

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()
  if (!me) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, riot_gamename, riot_tagline, val_gamename, val_tagline, val_tier, tier, game_type, avatar_url, country, manner_score, account_type')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [{ data: memberships }, { data: myTeam }] = await Promise.all([
    supabase.from('team_members').select('role, teams(id, name, game_type, tier_avg, wins, losses)').eq('user_id', id),
    supabase.from('team_members').select('role, teams(id, name, captain_id)').eq('user_id', me.id).maybeSingle(),
  ])

  const teams = (memberships ?? [])
    .map((m) => ({ role: m.role as string, team: (Array.isArray(m.teams) ? m.teams[0] : m.teams) as TeamRow | null }))
    .filter((t): t is { role: string; team: TeamRow } => !!t.team)

  // 스크림 전적: 출전 팀(주장/IGL/선수) 기준. 코치만이면 출전 기록 없음.
  const playingTeam = teams.find((t) => ['captain', 'igl', 'player'].includes(t.role))?.team
  const wins = playingTeam?.wins ?? 0
  const losses = playingTeam?.losses ?? 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : null

  const myTeamData = Array.isArray(myTeam?.teams) ? myTeam?.teams[0] : myTeam?.teams
  const iAmCaptain = myTeam?.role === 'captain'
  const isMe = id === me.id
  const isCoach = profile.account_type === 'coach'
  const gc = GAME_COLOR[profile.game_type ?? ''] ?? '#00D2BE'
  const gameName = profile.val_gamename ?? profile.riot_gamename
  const tagline = profile.val_tagline ?? profile.riot_tagline
  const tier = profile.val_tier ?? profile.tier

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-2xl mx-auto px-6 py-8">

        {/* 프로필 헤더 */}
        <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden mb-6">
          <div className="h-24" style={{ background: `linear-gradient(to right, ${gc}18, transparent)` }} />
          <div className="px-6 pb-6 -mt-10 flex items-end gap-5">
            <div className="w-20 h-20 rounded border-2 border-[#13131f] overflow-hidden bg-[#0d0d18] shrink-0">
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover object-top" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: gc }}>{gameName?.[0]?.toUpperCase() ?? '?'}</div>
              }
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <FlagImg code={profile.country} size={16} />
                <h1 className="text-white font-black text-xl">{gameName ?? '이름 없음'}</h1>
                {tagline && <span className="text-slate-500 text-sm">#{tagline}</span>}
                {isCoach && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#60a5fa1a', color: '#60a5fa' }}>코치</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {profile.game_type && (
                  <span className="text-xs font-bold" style={{ color: gc }}>{GAME_LABEL[profile.game_type] ?? profile.game_type}</span>
                )}
                {tier && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-400 text-xs">{tier}</span>
                  </>
                )}
              </div>
            </div>
            {!isMe && iAmCaptain && myTeamData && (
              <InviteButton type="team" targetId={myTeamData.id} />
            )}
          </div>
        </div>

        {/* 통계 — 매너 점수 / 스크림 전적 / 승률 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#13131f] border border-white/5 rounded px-4 py-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1.5">매너 점수</p>
            <p className="text-2xl font-black text-[#00D2BE]">{profile.manner_score ?? 100}</p>
          </div>
          <div className="bg-[#13131f] border border-white/5 rounded px-4 py-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1.5">스크림 전적</p>
            <p className="text-2xl font-black text-white">
              {total > 0 ? <>{wins}<span className="text-slate-600 text-base">승</span> {losses}<span className="text-slate-600 text-base">패</span></> : <span className="text-slate-600 text-base">기록 없음</span>}
            </p>
          </div>
          <div className="bg-[#13131f] border border-white/5 rounded px-4 py-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1.5">승률</p>
            <p className="text-2xl font-black text-white">{winRate !== null ? `${winRate}%` : '—'}</p>
          </div>
        </div>

        {/* 소속 팀 (여러 팀 — 코치는 여러 팀 가능) */}
        <div className="bg-[#13131f] border border-white/5 rounded p-5">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
            소속 팀 {teams.length > 1 && <span className="text-slate-600">{teams.length}</span>}
          </p>
          {teams.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {teams.map(({ role, team }) => (
                <a key={team.id} href={`/teams/${team.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                  <div className="w-10 h-10 rounded border border-white/10 bg-[#0d0d18] flex items-center justify-center font-black text-lg shrink-0"
                    style={{ color: GAME_COLOR[team.game_type ?? ''] ?? '#00D2BE' }}>
                    {team.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm truncate">{team.name}</p>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: ROLE_COLOR[role] ?? '#94a3b8' }}>{ROLE_LABEL[role] ?? role}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{GAME_LABEL[team.game_type ?? ''] ?? ''} {team.tier_avg ? `· ${team.tier_avg}` : ''}</p>
                  </div>
                  <span className="ml-auto text-[#00D2BE] text-xs shrink-0">→</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm">소속된 팀이 없어요</p>
          )}
        </div>
      </div>
    </div>
  )
}
