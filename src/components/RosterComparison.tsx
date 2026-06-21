import { FlagImg } from './CountrySelect'

type Member = {
  user_id: string
  role: string
  is_igl: boolean
  users: {
    val_gamename: string | null
    riot_gamename: string | null
    val_tier: string | null
    tier: string | null
    country: string | null
    avatar_url: string | null
  } | null
}

function PlayerCard({ member, flip = false }: { member: Member; flip?: boolean }) {
  const u = member.users
  const name = u?.val_gamename ?? u?.riot_gamename ?? '알 수 없음'
  const tier = u?.val_tier ?? u?.tier ?? null

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 border border-white/8 bg-[#0d0d14] hover:border-white/20 transition ${flip ? 'flex-row-reverse' : ''}`}>
      {u?.avatar_url
        ? <img src={u.avatar_url} alt="" className="w-8 h-8 object-cover shrink-0" />
        : <div className="w-8 h-8 bg-[#1a1a2e] flex items-center justify-center text-xs font-black text-white/20 shrink-0">{name[0]}</div>
      }
      <div className={`min-w-0 flex-1 ${flip ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-1.5 ${flip ? 'justify-end' : ''}`}>
          <FlagImg code={u?.country} size={12} />
          <span className="text-white text-xs font-semibold truncate">{name}</span>
          {member.role === 'captain' && (
            <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-500/20 text-amber-400 shrink-0">C</span>
          )}
          {member.is_igl && (
            <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#00D2BE]/20 text-[#00D2BE] shrink-0">IGL</span>
          )}
        </div>
        {tier && <p className="text-slate-600 text-[10px] mt-0.5">{tier}</p>}
      </div>
    </div>
  )
}

function EmptyCard({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 border border-white/5 bg-[#0d0d14]/50`}>
      <div className="w-8 h-8 bg-white/3 shrink-0" />
      <div className="flex-1 h-3 bg-white/3" />
    </div>
  )
}

function sortRoster(members: Member[]) {
  const igl = members.find((m) => m.is_igl)
  const rest = members.filter((m) => !m.is_igl)
  // IGL을 3번째(인덱스 2) 위치에 고정
  const result: (Member | null)[] = [...rest]
  if (igl) result.splice(2, 0, igl)
  return result
}

export default function RosterComparison({ team1Members, team2Members, team1Name, team2Name }: {
  team1Members: Member[]
  team2Members: Member[]
  team1Name: string
  team2Name: string
}) {
  const roster1 = sortRoster(team1Members)
  const roster2 = sortRoster(team2Members)
  const maxLen = Math.max(roster1.length, roster2.length, 5)

  return (
    <div className="bg-[#13131f] border border-white/5 mb-6">
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-white font-bold text-xs uppercase tracking-widest">로스터 비교</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-0 p-4 gap-x-4">
        {/* 팀 1 이름 */}
        <p className="text-white text-xl font-black mb-3 tracking-wide">{team1Name}</p>
        <div />
        {/* 팀 2 이름 */}
        <p className="text-white text-xl font-black mb-3 text-right tracking-wide">{team2Name}</p>

        {/* 플레이어 rows */}
        {Array.from({ length: maxLen }).map((_, i) => {
          const m1 = roster1[i] ?? null
          const m2 = roster2[i] ?? null
          const isIglRow = (m1?.is_igl || m2?.is_igl)

          return (
            <>
              <div key={`t1-${i}`} className={isIglRow ? 'ring-1 ring-[#00D2BE]/30' : ''}>
                {m1 ? <PlayerCard member={m1} /> : <EmptyCard />}
              </div>

              <div key={`vs-${i}`} className="flex items-center justify-center px-2">
                {i === Math.floor(maxLen / 2)
                  ? <span className="text-slate-700 text-xs font-black">VS</span>
                  : <div className="w-px h-full bg-white/5" />
                }
              </div>

              <div key={`t2-${i}`} className={isIglRow ? 'ring-1 ring-[#00D2BE]/30' : ''}>
                {m2 ? <PlayerCard member={m2} flip /> : <EmptyCard flip />}
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}
