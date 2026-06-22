import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import ScrimsClient from './ScrimsClient'
import Link from 'next/link'

const PAGE_SIZE = 15

const STATUS_LABEL: Record<string, string> = {
  recruiting: '모집중', full: '인원마감', ongoing: '진행중', done: '종료',
}
const STATUS_COLOR: Record<string, string> = {
  recruiting: 'bg-green-500/10 text-green-400',
  full: 'bg-yellow-500/10 text-yellow-400',
  ongoing: 'bg-[#00D2BE]/10 text-[#00D2BE]',
  done: 'bg-white/5 text-slate-500',
}
const MODE_LABEL: Record<string, string> = {
  random: '랜덤', balanced: '밸런스', captain: '캡틴픽',
}

function formatDate(dt: string | null) {
  if (!dt) return null
  return new Date(dt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ValorantScrimsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tab?: string }>
}) {
  const { q = '', page: pageStr = '1', tab = 'scrim' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 스크림 탭 데이터
  const { data: myTeam } = await supabase
    .from('teams')
    .select('tier_avg')
    .eq('captain_id', user.id)
    .eq('game_type', 'valorant')
    .single()

  const myTier = myTeam?.tier_avg ?? null

  let posts: any[] = []
  let total = 0

  if (tab === 'scrim') {
    if (q) {
      const { data: matched } = await supabase.from('teams').select('id').ilike('name', `%${q}%`)
      const teamIds = matched?.map((t: any) => t.id) ?? []
      if (teamIds.length > 0) {
        const { data, count } = await supabase
          .from('scrim_posts')
          .select('id, game_type, preferred_date, note, status, format, tier_min, tier_max, created_at, teams(id, name, tier_avg)', { count: 'exact' })
          .eq('status', 'open').eq('game_type', 'valorant').in('team_id', teamIds)
          .order('created_at', { ascending: false })
          .range(from, to)
        posts = data ?? []
        total = count ?? 0
      }
    } else {
      const { data, count } = await supabase
        .from('scrim_posts')
        .select('id, game_type, preferred_date, note, status, format, tier_min, tier_max, created_at, teams(id, name, tier_avg)', { count: 'exact' })
        .eq('status', 'open').eq('game_type', 'valorant')
        .order('created_at', { ascending: false })
        .range(from, to)
      posts = data ?? []
      total = count ?? 0
    }
  }

  // 내전 탭 데이터
  let rooms: any[] = []

  if (tab === 'inhouse') {
    const { data: roomData } = await supabase
      .from('inhouse_rooms')
      .select('*, host:users!host_id(val_gamename, riot_gamename)')
      .in('status', ['recruiting', 'full', 'ongoing'])
      .order('created_at', { ascending: false })
      .limit(30)

    const roomIds = (roomData ?? []).map((r: any) => r.id)
    const { data: counts } = roomIds.length
      ? await supabase.from('inhouse_participants').select('room_id').in('room_id', roomIds)
      : { data: [] }

    const countMap: Record<string, number> = {}
    ;(counts ?? []).forEach((p: any) => { countMap[p.room_id] = (countMap[p.room_id] ?? 0) + 1 })

    rooms = (roomData ?? []).map((r: any) => ({
      ...r,
      host: Array.isArray(r.host) ? r.host[0] : r.host,
      participant_count: countMap[r.id] ?? 0,
    }))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_posts"]} />
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto px-6 py-8">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {tab === 'inhouse' ? '내전' : '스크림 게시판'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {tab === 'inhouse' ? '팀 없이도 즐기는 즉석 팀전' : '발로란트 스크림 상대를 구해보세요'}
            </p>
          </div>
          {tab === 'inhouse' ? (
            <Link href="/inhouse/create"
              className="bg-[#00D2BE] hover:bg-[#00a896] text-white px-4 py-2 rounded text-sm font-semibold transition">
              + 방 만들기
            </Link>
          ) : (
            <a href="/scrims/post" className="bg-[#ff4655] hover:bg-[#e03040] text-white px-4 py-2 rounded text-sm font-semibold transition">
              + 스크림 올리기
            </a>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-lg p-1 mb-6 w-fit">
          <a
            href="/valorant/scrims?tab=scrim"
            className={`px-5 py-1.5 rounded text-xs font-bold transition ${
              tab === 'scrim'
                ? 'bg-[#ff4655] text-white shadow'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            스크림
          </a>
          <a
            href="/valorant/scrims?tab=inhouse"
            className={`px-5 py-1.5 rounded text-xs font-bold transition ${
              tab === 'inhouse'
                ? 'bg-[#00D2BE] text-white shadow'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            내전
          </a>
        </div>

        {/* 스크림 탭 */}
        {tab === 'scrim' && (
          <ScrimsClient
            posts={posts}
            myTier={myTier}
            q={q}
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
          />
        )}

        {/* 내전 탭 */}
        {tab === 'inhouse' && (
          rooms.length === 0 ? (
            <div className="bg-[#13131f] border border-white/5 rounded-2xl p-16 text-center">
              <p className="text-3xl mb-4">🎮</p>
              <p className="text-white font-semibold">현재 모집 중인 내전이 없어요</p>
              <p className="text-slate-500 text-sm mt-1">첫 번째로 방을 만들어보세요!</p>
              <Link href="/inhouse/create"
                className="mt-6 inline-block bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">
                + 방 만들기
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rooms.map((room: any) => (
                <Link key={room.id} href={`/inhouse/${room.id}`}
                  className="bg-[#13131f] border border-white/5 hover:border-[#00D2BE]/30 rounded-xl px-6 py-4 flex items-center gap-5 transition group">
                  <div className="w-2 h-12 rounded-full shrink-0 bg-[#00D2BE]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition">{room.title}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLOR[room.status]}`}>
                        {STATUS_LABEL[room.status]}
                      </span>
                      <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded">
                        {MODE_LABEL[room.team_mode]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>방장: {room.host?.val_gamename ?? room.host?.riot_gamename ?? '—'}</span>
                      {room.scheduled_at && <span>📅 {formatDate(room.scheduled_at)}</span>}
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
                    <p className="text-slate-600 text-[10px] mt-0.5">명</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
