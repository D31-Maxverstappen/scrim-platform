import { D31ScoreBadge } from '@/components/profile/D31ScoreCard'
import RankIcon from '@/components/common/RankIcon'

export type DirUser = {
  id: string
  val_gamename: string | null
  riot_gamename: string | null
  val_tier: string | null
  tier: string | null
  avatar_url: string | null
}

// 선수/코치 목록 공용 표. variant로 컬럼·빈 상태 문구만 분기한다.
export default function UserDirectory({
  users,
  variant,
}: {
  users: DirUser[]
  variant: 'player' | 'coach'
}) {
  const isCoach = variant === 'coach'

  if (users.length === 0) {
    return (
      <div className="bg-[#13131f] border border-white/5 rounded text-center py-12 text-slate-600 text-sm">
        {isCoach ? '아직 등록된 코치가 없어요' : '아직 등록된 선수가 없어요'}
      </div>
    )
  }

  return (
    <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-white/5 text-xs text-slate-600 uppercase tracking-wider">
        <span className={isCoach ? 'col-span-7' : 'col-span-5'}>{isCoach ? '코치' : '선수'}</span>
        <span className="col-span-3">{isCoach ? '유형' : '티어'}</span>
        {!isCoach && <span className="col-span-2">D31 Rating</span>}
        <span className="col-span-2 text-right">프로필</span>
      </div>
      <div className="divide-y divide-white/5">
        {users.map((u) => {
          const name = u.val_gamename ?? u.riot_gamename ?? '(이름 없음)'
          const tier = u.val_tier ?? u.tier ?? '—'
          return (
            <div key={u.id} className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-white/3 transition">
              <a href={`/users/${u.id}`} className={`${isCoach ? 'col-span-7' : 'col-span-5'} flex items-center gap-3 group min-w-0`}>
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center overflow-hidden text-white font-black">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
                    : name[0]?.toUpperCase()}
                </span>
                <span className="text-white font-semibold group-hover:text-[#00D2BE] transition truncate">{name}</span>
              </a>
              <span className="col-span-3">
                {isCoach
                  ? <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded">코치</span>
                  : <span className="inline-flex items-center gap-1 whitespace-nowrap text-slate-400 text-sm"><RankIcon tier={tier} size={22} />{tier}</span>}
              </span>
              {!isCoach && (
                <span className="col-span-2">
                  <D31ScoreBadge seed={u.id} />
                </span>
              )}
              <div className="col-span-2 flex justify-end">
                <a href={`/users/${u.id}`} className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1 transition">보기</a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
