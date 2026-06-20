import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteDiscordChannel } from '@/lib/discord'

type MapInput = {
  map_number: number
  map_name: string
  team1_score: number
  team2_score: number
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { maps }: { maps: MapInput[] } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: match } = await supabase
    .from('matches')
    .select('id, status, team1_id, team2_id, format, discord_channel_id')
    .eq('id', id)
    .single()

  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없어요.' }, { status: 404 })
  if (match.status === 'completed') return NextResponse.json({ error: '이미 종료된 매치예요.' }, { status: 400 })

  const { data: captainCheck } = await supabase
    .from('teams')
    .select('id')
    .in('id', [match.team1_id, match.team2_id])
    .eq('captain_id', user.id)
    .single()
  if (!captainCheck) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  // 각 맵 업데이트
  await Promise.all(maps.map((m) =>
    supabase.from('match_maps').update({
      map_name: m.map_name,
      team1_score: m.team1_score,
      team2_score: m.team2_score,
    }).eq('match_id', id).eq('map_number', m.map_number)
  ))

  // 시리즈 승자 계산
  const team1MapWins = maps.filter((m) => m.team1_score > m.team2_score).length
  const team2MapWins = maps.filter((m) => m.team2_score > m.team1_score).length
  const winnerId = team1MapWins > team2MapWins
    ? match.team1_id
    : team2MapWins > team1MapWins
      ? match.team2_id
      : null

  // 매치 완료 처리
  await supabase.from('matches').update({
    status: 'completed',
    ...(winnerId ? { winner_id: winnerId } : {}),
  }).eq('id', id)

  // 팀 전적 반영
  if (winnerId) {
    const loserId = winnerId === match.team1_id ? match.team2_id : match.team1_id
    await Promise.all([
      supabase.rpc('increment_wins', { team_id: winnerId }),
      supabase.rpc('increment_losses', { team_id: loserId }),
    ])
  }

  // Discord 채널 삭제
  if (match.discord_channel_id) {
    await Promise.all(
      match.discord_channel_id.split(',').filter(Boolean).map((cid: string) => deleteDiscordChannel(cid))
    )
    await supabase.from('matches').update({ discord_channel_id: null }).eq('id', id)
  }

  return NextResponse.json({ success: true, winnerId, team1MapWins, team2MapWins })
}
