import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notify } from '@/lib/notifications'

const admin = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const TIER_RANK: Record<string, number> = {
  'Iron 3': 1,   'Iron 2': 2,   'Iron 1': 3,
  'Bronze 3': 4, 'Bronze 2': 5, 'Bronze 1': 6,
  'Silver 3': 7, 'Silver 2': 8, 'Silver 1': 9,
  'Gold 3': 10,  'Gold 2': 11,  'Gold 1': 12,
  'Platinum 3': 13, 'Platinum 2': 14, 'Platinum 1': 15,
  'Diamond 3': 16,  'Diamond 2': 17,  'Diamond 1': 18,
  'Ascendant 3': 19, 'Ascendant 2': 20, 'Ascendant 1': 21,
  'Immortal 3': 22,  'Immortal 2': 23,  'Immortal 1': 24,
  'Radiant': 25,
  // 하위 호환 (구 포맷)
  'Iron': 2, 'Bronze': 5, 'Silver': 8, 'Gold': 11, 'Platinum': 14,
  'Diamond': 17, 'Ascendant': 20, 'Immortal': 23, 'Unranked': 8,
}

function tierToRank(tierAvg: string | null): number {
  if (!tierAvg) return 8
  return TIER_RANK[tierAvg.trim()] ?? 8
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { game_type, format, server } = await req.json()

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, tier_avg, captain_id')
    .eq('captain_id', user.id)
    .eq('game_type', game_type)
    .single()

  if (!team) return NextResponse.json({ error: '해당 게임의 팀 캡틴이어야 해요.' }, { status: 403 })

  const db = admin()
  const tier_rank = tierToRank(team.tier_avg)

  // 이미 큐에 있으면 → matched면 반환, waiting이면 상대 탐색 계속
  const { data: existing } = await db
    .from('matchmaking_queue')
    .select('*')
    .eq('team_id', team.id)
    .single()

  if (existing?.status === 'matched') {
    return NextResponse.json({ status: 'matched', matchId: existing.match_id })
  }

  // 기존 waiting 엔트리가 없으면 새로 삽입
  let entryId: string
  if (existing) {
    entryId = existing.id
  } else {
    const { data: entry, error } = await db
      .from('matchmaking_queue')
      .insert({ team_id: team.id, game_type, format, server, tier_rank, status: 'waiting' })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    entryId = entry.id
  }

  const tierRange = 2

  // 상대 탐색: 같은 게임/서버/포맷 + 티어 범위 제한
  const { data: opponents } = await db
    .from('matchmaking_queue')
    .select('*, teams(id, name, captain_id)')
    .eq('game_type', game_type)
    .eq('server', server)
    .eq('format', format)
    .eq('status', 'waiting')
    .neq('team_id', team.id)
    .gte('tier_rank', tier_rank - tierRange)
    .lte('tier_rank', tier_rank + tierRange)
    .order('created_at', { ascending: true })
    .limit(1)

  if (!opponents || opponents.length === 0) {
    return NextResponse.json({ status: 'waiting', queueId: entryId })
  }

  const opponent = opponents[0]
  const opponentTeam = Array.isArray(opponent.teams) ? opponent.teams[0] : opponent.teams

  if (!opponentTeam) {
    return NextResponse.json({ status: 'waiting', queueId: entryId })
  }

  // 매치 생성
  const now = new Date().toISOString()
  const { data: match, error: matchError } = await db
    .from('matches')
    .insert({
      team1_id: team.id,
      team2_id: opponentTeam.id,
      format,
      status: 'scheduled',
      match_date: now,
    })
    .select()
    .single()

  if (matchError || !match) {
    return NextResponse.json({ error: '매치 생성 실패: ' + matchError?.message }, { status: 500 })
  }

  // 매칭 완료 → 큐 엔트리 삭제 (중복 매치 방지)
  await Promise.all([
    db.from('matchmaking_queue').delete().eq('id', entryId),
    db.from('matchmaking_queue').delete().eq('id', opponent.id),
  ])

  // 알림 발송
  const matchLink = `/matches/${match.id}`
  await Promise.all([
    notify(user.id, 'matchmaking', '자동 매칭 완료!', `${opponentTeam.name}과의 매치가 잡혔어요.`, matchLink),
    notify(opponentTeam.captain_id, 'matchmaking', '자동 매칭 완료!', `${team.name}과의 매치가 잡혔어요.`, matchLink),
  ])

  return NextResponse.json({ status: 'matched', matchId: match.id })
}
