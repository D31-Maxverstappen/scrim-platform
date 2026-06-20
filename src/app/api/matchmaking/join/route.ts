import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'

const TIER_RANK: Record<string, number> = {
  Iron: 10, Bronze: 20, Silver: 30, Gold: 40, Platinum: 50,
  Emerald: 55, Diamond: 60, Ascendant: 65, Immortal: 75,
  Master: 75, Grandmaster: 85, Radiant: 90, Challenger: 90,
  Unranked: 30,
}

function tierToRank(tierAvg: string | null): number {
  if (!tierAvg) return 30
  const base = tierAvg.trim().split(' ')[0]
  return TIER_RANK[base] ?? 30
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

  // 이미 큐에 있으면 현재 상태 반환
  const { data: existing } = await supabase
    .from('matchmaking_queue')
    .select('*')
    .eq('team_id', team.id)
    .single()

  if (existing) {
    return NextResponse.json({ status: existing.status, matchId: existing.match_id, queueId: existing.id })
  }

  const tier_rank = tierToRank(team.tier_avg)

  // 큐에 등록
  const { data: entry, error } = await supabase
    .from('matchmaking_queue')
    .insert({ team_id: team.id, game_type, format, server, tier_rank, status: 'waiting' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 상대 탐색: 같은 게임/서버/포맷, 티어 차이 ±20 이내, 가장 오래 기다린 팀
  const { data: opponents } = await supabase
    .from('matchmaking_queue')
    .select('*, teams(id, name, captain_id)')
    .eq('game_type', game_type)
    .eq('server', server)
    .eq('format', format)
    .eq('status', 'waiting')
    .neq('team_id', team.id)
    .gte('tier_rank', tier_rank - 20)
    .lte('tier_rank', tier_rank + 20)
    .order('created_at', { ascending: true })
    .limit(1)

  if (!opponents || opponents.length === 0) {
    return NextResponse.json({ status: 'waiting', queueId: entry.id })
  }

  const opponent = opponents[0]
  const opponentTeam = Array.isArray(opponent.teams) ? opponent.teams[0] : opponent.teams

  // 매치 생성
  const now = new Date().toISOString()
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      team1_id: team.id,
      team2_id: opponentTeam.id,
      format,
      status: 'scheduled',
      match_date: now,
      game_type,
    })
    .select()
    .single()

  if (matchError || !match) {
    return NextResponse.json({ status: 'waiting', queueId: entry.id })
  }

  // 양팀 큐 상태 업데이트
  await Promise.all([
    supabase.from('matchmaking_queue').update({ status: 'matched', match_id: match.id }).eq('id', entry.id),
    supabase.from('matchmaking_queue').update({ status: 'matched', match_id: match.id }).eq('id', opponent.id),
  ])

  // 알림 발송
  const matchLink = `/matches/${match.id}`
  await Promise.all([
    notify(user.id, 'matchmaking', '자동 매칭 완료!', `${opponentTeam.name}과의 매치가 잡혔어요.`, matchLink),
    notify(opponentTeam.captain_id, 'matchmaking', '자동 매칭 완료!', `${team.name}과의 매치가 잡혔어요.`, matchLink),
  ])

  return NextResponse.json({ status: 'matched', matchId: match.id })
}
