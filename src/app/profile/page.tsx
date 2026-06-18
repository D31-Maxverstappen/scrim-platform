import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import AvatarUpload from '@/components/AvatarUpload'
import CountrySelect from '@/components/CountrySelect'

const TIER_COLOR: Record<string, string> = {
  Iron: 'text-slate-400', Bronze: 'text-orange-700', Silver: 'text-slate-300',
  Gold: 'text-yellow-400', Platinum: 'text-teal-400', Emerald: 'text-emerald-400',
  Diamond: 'text-blue-400', Master: 'text-purple-400', Grandmaster: 'text-red-400',
  Challenger: 'text-yellow-300', Ascendant: 'text-green-400', Immortal: 'text-red-500',
  Radiant: 'text-yellow-200', Unranked: 'text-slate-500',
}

const GAME_LABEL: Record<string, string> = {
  lol: 'League of Legends',
  valorant: 'Valorant',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role, teams(id, name, game_type, tier_avg)')
    .eq('user_id', user.id)
    .single()

  const team = (Array.isArray(teamMember?.teams) ? teamMember?.teams[0] : teamMember?.teams) as { id: string; name: string; game_type: string; tier_avg: string } | null | undefined

  const tierColor = TIER_COLOR[profile?.tier ?? ''] ?? 'text-slate-400'

  return (
    <div className="min-h-screen bg-[#07070b]">
      <Navbar />
      <div className="pt-20 max-w-3xl mx-auto px-6 py-10">

        {/* 프로필 헤더 */}
        <div className="bg-[#111118] border border-white/5 rounded p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
          <AvatarUpload
            userId={user.id}
            initialUrl={profile?.avatar_url ?? null}
            initials={profile?.riot_gamename?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-white font-black text-2xl">
                {profile?.riot_gamename ?? '이름 없음'}
              </h1>
              {profile?.riot_tagline && (
                <span className="text-slate-500 text-sm">#{profile.riot_tagline}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {profile?.game_type && (
                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded">
                  {GAME_LABEL[profile.game_type] ?? profile.game_type}
                </span>
              )}
              {profile?.tier && (
                <span className={`text-sm font-bold ${tierColor}`}>
                  {profile.tier}
                </span>
              )}
              {!profile?.riot_gamename && (
                <a href="/onboarding" className="text-xs text-[#00D2BE] hover:underline">
                  + 라이엇 계정 연동하기
                </a>
              )}
            </div>
            {/* 국가 선택 */}
            <div className="mt-3">
              <CountrySelect initialCountry={profile?.country ?? null} />
            </div>
            <p className="text-slate-600 text-xs mt-2">{user.email}</p>
          </div>
          <a
            href="/onboarding"
            className="shrink-0 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded transition"
          >
            프로필 수정
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* 매너 점수 */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">매너 점수</p>
            <p className="text-4xl font-black text-white mb-2">100</p>
            <div className="w-full bg-white/5 rounded h-1.5 mb-2">
              <div className="bg-gradient-to-r from-[#00D2BE] to-[#00a896] h-1.5 rounded" style={{ width: '50%' }} />
            </div>
            <p className="text-slate-600 text-xs">기본 등급 · 0~200pt</p>
          </div>

          {/* 소속 팀 */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">소속 팀</p>
            {team ? (
              <>
                <p className="text-white font-bold text-lg mb-1">{team.name}</p>
                <p className="text-slate-500 text-xs">{GAME_LABEL[team.game_type] ?? team.game_type}</p>
                {team.tier_avg && <p className="text-[#00D2BE] text-xs mt-1">{team.tier_avg}</p>}
                <span className="inline-block mt-2 text-xs bg-[#00D2BE]/20 text-[#00D2BE] px-2 py-0.5 rounded">
                  {teamMember?.role === 'captain' ? '캡틴' : '멤버'}
                </span>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-slate-600 text-sm">소속 팀 없음</p>
                <a href="/teams/create" className="text-xs text-[#00D2BE] hover:underline">팀 만들기 →</a>
              </div>
            )}
          </div>

          {/* 전적 */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">스크림 전적</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-black text-white">0</span>
              <span className="text-slate-500 text-sm mb-1">승</span>
              <span className="text-4xl font-black text-slate-600">0</span>
              <span className="text-slate-600 text-sm mb-1">패</span>
            </div>
            <p className="text-slate-600 text-xs">승률 —</p>
          </div>

        </div>

        {/* 최근 스크림 */}
        <div className="bg-[#111118] border border-white/5 rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">최근 스크림</h2>
            <a href="/scrims" className="text-[#00D2BE] text-xs hover:underline">전체 보기 →</a>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <svg className="w-10 h-10 mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6l3-3 3 3v6M3 21h18" />
            </svg>
            <p className="text-sm">아직 스크림 기록이 없어요</p>
          </div>
        </div>

      </div>
    </div>
  )
}
