import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteDiscordChannel } from '@/lib/discord'
import { notify } from '@/lib/notifications'

async function getMatchAndCheckCaptain(supabase: any, matchId: string, userId: string) {
  const { data: match } = await supabase
    .from('matches')
    .select('id, status, team1_id, team2_id, discord_channel_id, discord_lobby_channel_id')
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

  // 팀 전적 갱신
  if (winner_id) {
    const loserId = match.team1_id === winner_id ? match.team2_id : match.team1_id
    await Promise.all([
      supabase.rpc('increment_wins', { team_id: winner_id }),
      supabase.rpc('increment_losses', { team_id: loserId }),
    ])
  }

  if (match.discord_channel_id) {
    await Promise.all(
      match.discord_channel_id.split(',').filter(Boolean).map((cid: string) => deleteDiscordChannel(cid))
    )
    await supabase.from('matches').update({ discord_channel_id: null }).eq('id', id)
  }
  if (match.discord_lobby_channel_id) {
    await deleteDiscordChannel(match.discord_lobby_channel_id)
    await supabase.from('matches').update({ discord_lobby_channel_id: null } as never).eq('id', id)
  }

  return NextResponse.json({ success: true })
}

// 매치 취소 (소프트 취소 — 기록 보존 + 사유 표시 + 상대 캡틴 알림)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { match, isCaptain } = await getMatchAndCheckCaptain(supabase, id, user.id)
  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없어요.' }, { status: 404 })
  if (!isCaptain) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (match.status === 'completed') return NextResponse.json({ error: '완료된 매치는 취소할 수 없어요.' }, { status: 400 })
  if (match.status === 'cancelled') return NextResponse.json({ error: '이미 취소된 매치예요.' }, { status: 400 })

  // 취소한 캡틴의 팀 → 상대 팀 판별
  const { data: myTeam } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', [match.team1_id, match.team2_id].filter((v): v is string => !!v))
    .eq('captain_id', user.id)
    .single()
  const otherTeamId = myTeam?.id === match.team1_id ? match.team2_id : match.team1_id

  // 소프트 취소 (행 보존 + 사유)
  await supabase.from('matches').update({ status: 'cancelled', cancel_reason: 'captain_cancelled' } as never).eq('id', id)

  // Discord 채널 정리 (음성 + 로비)
  if (match.discord_channel_id) {
    await Promise.all(
      match.discord_channel_id.split(',').filter(Boolean).map((cid: string) => deleteDiscordChannel(cid))
    )
  }
  if (match.discord_lobby_channel_id) {
    await deleteDiscordChannel(match.discord_lobby_channel_id)
  }

  // 상대 팀 캡틴에게 알림
  if (otherTeamId) {
    const { data: otherTeam } = await supabase.from('teams').select('captain_id').eq('id', otherTeamId).single()
    if (otherTeam?.captain_id) {
      await notify(otherTeam.captain_id, 'match_cancelled', '매치가 취소됐어요', `${myTeam?.name ?? '상대 팀'}이(가) 예정된 매치를 취소했어요.`, `/matches/${id}`)
    }
  }

  return NextResponse.json({ success: true })
}
