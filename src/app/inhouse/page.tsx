export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { formatKST } from '@/lib/datetime'
import { CalendarIcon } from '@/components/common/icons'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EmptyState, EmptyIcons } from '@/components/common/EmptyState'

const STATUS_LABEL: Record<string, string> = {
  recruiting: '모집중',
  full: '인원마감',
  ongoing: '진행중',
  done: '종료',
}
const STATUS_COLOR: Record<string, string> = {
  recruiting: 'bg-green-500/10 text-green-400',
  full: 'bg-yellow-500/10 text-yellow-400',
  ongoing: 'bg-[#00D2BE]/10 text-[#00D2BE]',
  done: 'bg-white/5 text-slate-500',
}
const MODE_LABEL: Record<string, string> = {
  random: '랜덤',
  balanced: '밸런스',
  captain: '캡틴픽',
}

function formatDate(dt: string | null) {
  if (!dt) return null
  return formatKST(dt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function InhousePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rooms } = await supabase
    .from('inhouse_rooms')
    .select('*, host:users!host_id(val_gamename, riot_gamename)')
    .in('status', ['recruiting', 'full', 'ongoing'])
    .order('created_at', { ascending: false })
    .limit(30)

  const roomIds = (rooms ?? []).map((r) => r.id)
  const { data: counts } = roomIds.length
    ? await supabase.from('inhouse_participants').select('room_id').in('room_id', roomIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  ;(counts ?? []).forEach((p) => { if (p.room_id) countMap[p.room_id] = (countMap[p.room_id] ?? 0) + 1 })

  const enriched = (rooms ?? []).map((r) => ({
    ...r,
    host: Array.isArray(r.host) ? r.host[0] : r.host,
    participant_count: countMap[r.id] ?? 0,
  }))

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">내전</h1>
            <p className="text-slate-400 text-sm mt-1">팀 없이도 즐기는 즉석 팀전</p>
          </div>
          <Link href="/inhouse/create"
            className="bg-[#00D2BE] hover:bg-[#00a896] text-white px-4 py-2 rounded text-sm font-semibold transition">
            + 방 만들기
          </Link>
        </div>

        {enriched.length === 0 ? (
          <EmptyState
            accent="#00D2BE"
            icon={EmptyIcons.target}
            title="현재 모집 중인 내전이 없어요"
            description="첫 번째로 방을 만들어보세요!"
            action={<Link href="/inhouse/create" className="inline-block bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">+ 방 만들기</Link>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {enriched.map((room) => (
              <Link key={room.id} href={`/inhouse/${room.id}`}
                className="bg-[#13131f] border border-white/5 hover:border-[#00D2BE]/30 rounded-xl px-6 py-4 flex items-center gap-5 transition group">
                <div className="w-2 h-12 rounded-none shrink-0 bg-[#00D2BE]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition">{room.title}</span>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded ${STATUS_COLOR[room.status]}`}>
                      {STATUS_LABEL[room.status]}
                    </span>
                    <span className="text-[11px] font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded">
                      {MODE_LABEL[room.team_mode]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>방장: {room.host?.val_gamename ?? room.host?.riot_gamename ?? '—'}</span>
                    {room.scheduled_at && <span className="inline-flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 shrink-0" />{formatDate(room.scheduled_at)}</span>}
                    {(room.tier_min || room.tier_max) && (
                      <span>
                        {room.tier_min && room.tier_max
                          ? `${room.tier_min} ~ ${room.tier_max}`
                          : room.tier_min ? `${room.tier_min} 이상` : `${room.tier_max} 이하`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-white font-bold text-sm">
                    {room.participant_count} <span className="text-slate-600 font-normal">/ {room.max_players}</span>
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">명</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
