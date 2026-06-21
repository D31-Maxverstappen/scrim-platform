import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { FlagImg } from '@/components/CountrySelect'
import InviteButton from '@/components/InviteButton'

const GAME_LABEL: Record<string, string> = { valorant: 'VALORANT' }
const GAME_COLOR: Record<string, string> = { valorant: '#ff4655' }

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()
  if (!me) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, riot_gamename, riot_tagline, val_gamename, val_tagline, val_tier, tier, game_type, avatar_url, country')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [{ data: membership }, { data: myTeam }] = await Promise.all([
    supabase.from('team_members').select('role, teams(id, name, game_type, tier_avg)').eq('user_id', id).maybeSingle(),
    supabase.from('team_members').select('role, teams(id, name, captain_id)').eq('user_id', me.id).maybeSingle(),
  ])

  const userTeam = Array.isArray(membership?.teams) ? membership?.teams[0] : membership?.teams
  const myTeamData = Array.isArray(myTeam?.teams) ? myTeam?.teams[0] : myTeam?.teams
  const iAmCaptain = myTeam?.role === 'captain'
  const isMe = id === me.id
  const gc = GAME_COLOR[profile.game_type ?? ''] ?? '#00D2BE'
  const gameName = profile.val_gamename ?? profile.riot_gamename
  const tagline = profile.val_tagline ?? profile.riot_tagline
  const tier = profile.val_tier ?? profile.tier

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-2xl mx-auto px-6 py-8">

        {/* 프로필 헤더 */}
        <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-[#00D2BE]/10 to-transparent" style={{ background: `linear-gradient(to right, ${gc}18, transparent)` }} />
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
              <InviteButton
                teamId={myTeamData.id}
                teamName={myTeamData.name}
                targetUserId={id}
                targetUserName={gameName ?? '이 유저'}
                targetUserTeamId={userTeam?.id ?? null}
              />
            )}
          </div>
        </div>

        {/* 소속 팀 */}
        <div className="bg-[#13131f] border border-white/5 rounded p-5">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">소속 팀</p>
          {userTeam ? (
            <a href={`/teams/${userTeam.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-10 h-10 rounded border border-white/10 bg-[#0d0d18] flex items-center justify-center font-black text-lg"
                style={{ color: GAME_COLOR[userTeam.game_type ?? ''] ?? '#00D2BE' }}>
                {userTeam.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{userTeam.name}</p>
                <p className="text-slate-500 text-xs">{GAME_LABEL[userTeam.game_type ?? ''] ?? ''} {userTeam.tier_avg ? `· ${userTeam.tier_avg}` : ''}</p>
              </div>
              <span className="ml-auto text-[#00D2BE] text-xs">→</span>
            </a>
          ) : (
            <p className="text-slate-600 text-sm">소속된 팀이 없어요</p>
          )}
        </div>
      </div>
    </div>
  )
}
