import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteDiscordChannel } from '@/lib/discord'

async function getMatchAndCheckCaptain(supabase: any, matchId: string, userId: string) {
  const { data: match } = await supabase
    .from('matches')
    .select('id, status, team1_id, team2_id, discord_channel_id')
    .eq('id', matchId)
    .single()

  if (!match) return { match: null, isCaptain: false }

  const { data: captainCheck } = await supabase
    .from('teams')
    .select('id')
    .in('id', [match.team1_id, match.team2_id])
    .eq('captain_id', userId)
    .single()

  return { match, isCaptain: !!captainCheck }
}

// 스크림 종료 (결과 입력 + Discord 채널 삭제)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { winner_id } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { match, isCaptain } = await getMatchAndCheckCaptain(supabase, id, user.id)
  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없어요.' }, { status: 404 })
  if (!isCaptain) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (match.status === 'completed') return NextResponse.json({ error: '이미 종료된 매치예요.' }, { status: 400 })

  await supabase.from('matches').update({
    status: 'completed',
    ...(winner_id ? { winner_id } : {}),
  }).eq('id', id)

  if (match.discord_channel_id) {
    await Promise.all(
      match.discord_channel_id.split(',').filter(Boolean).map((cid: string) => deleteDiscordChannel(cid))
    )
    await supabase.from('matches').update({ discord_channel_id: null }).eq('id', id)
  }

  return NextResponse.json({ success: true })
}

// 매치 취소
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { match, isCaptain } = await getMatchAndCheckCaptain(supabase, id, user.id)
  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없어요.' }, { status: 404 })
  if (!isCaptain) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (match.status === 'completed') return NextResponse.json({ error: '완료된 매치는 취소할 수 없어요.' }, { status: 400 })

  // Discord 채널 먼저 삭제
  if (match.discord_channel_id) {
    await Promise.all(
      match.discord_channel_id.split(',').filter(Boolean).map((cid: string) => deleteDiscordChannel(cid))
    )
  }

  await supabase.from('match_player_stats').delete().eq('match_id', id)
  await supabase.from('match_maps').delete().eq('match_id', id)
  await supabase.from('matches').delete().eq('id', id)

  return NextResponse.json({ success: true })
}
