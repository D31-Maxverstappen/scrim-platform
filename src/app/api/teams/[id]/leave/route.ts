import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalcTierAvg } from '@/lib/tierUtils'
import { removeDiscordRole, removeChannelPermission } from '@/lib/discord'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: team } = await supabase
    .from('teams')
    .select('captain_id, discord_role_id')
    .eq('id', teamId)
    .single()

  if (team?.captain_id === user.id)
    return NextResponse.json({ error: '캡틴은 탈퇴할 수 없어요. 팀 관리에서 팀을 삭제해주세요.' }, { status: 400 })

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcTierAvg(supabase, teamId)

  // Discord 팀 역할 제거 + 진행 중인 스크림 채널 권한 제거
  const { data: profile } = await supabase.from('users').select('discord_id').eq('id', user.id).single()
  const discordId = profile?.discord_id

  if (discordId) {
    if (team?.discord_role_id) {
      await removeDiscordRole(discordId, team.discord_role_id).catch(() => {})
    }

    // 진행 중인 매치의 Discord 채널에서 유저 권한 제거
    const { data: activeMatches } = await supabase
      .from('matches')
      .select('discord_channel_id')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
      .eq('status', 'ongoing')
      .not('discord_channel_id', 'is', null)

    const channelIds = (activeMatches ?? [])
      .flatMap((m) => (m.discord_channel_id ?? '').split(',').filter(Boolean))

    await Promise.all(channelIds.map((cid: string) => removeChannelPermission(cid, discordId).catch(() => {})))
  }

  return NextResponse.json({ success: true })
}
