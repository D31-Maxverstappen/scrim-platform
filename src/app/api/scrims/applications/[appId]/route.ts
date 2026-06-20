import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createScrimVoiceChannels } from '@/lib/discord'
import { notify } from '@/lib/notifications'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params
  const { action } = await req.json() // 'accept' | 'reject'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: app } = await supabase
    .from('scrim_applications')
    .select('id, scrim_post_id, status')
    .eq('id', appId)
    .single()

  if (!app) return NextResponse.json({ error: '신청을 찾을 수 없어요.' }, { status: 404 })
  if (app.status !== 'pending') return NextResponse.json({ error: '이미 처리된 신청이에요.' }, { status: 400 })

  const { data: post } = await supabase
    .from('scrim_posts')
    .select('team_id, teams(captain_id)')
    .eq('id', app.scrim_post_id)
    .single()

  const captain = (Array.isArray(post?.teams) ? post?.teams[0] : post?.teams) as { captain_id: string } | null
  if (captain?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'
  await supabase.from('scrim_applications').update({ status: newStatus }).eq('id', appId)

  if (action === 'accept') {
    const [{ data: scrimPost }, { data: applyApp }] = await Promise.all([
      supabase.from('scrim_posts').select('team_id, preferred_date, format').eq('id', app.scrim_post_id).single(),
      supabase.from('scrim_applications').select('applying_team_id').eq('id', appId).single(),
    ])

    if (!scrimPost) return NextResponse.json({ error: '스크림 포스트를 찾을 수 없어요.' }, { status: 404 })
    if (!applyApp?.applying_team_id) return NextResponse.json({ error: '신청 팀 정보를 찾을 수 없어요.' }, { status: 404 })

    const format = scrimPost.format ?? 'BO3'
    await supabase.from('scrim_posts').update({ status: 'matched' }).eq('id', app.scrim_post_id)

    const mapCount = format === 'BO5' ? 5 : format === 'BO1' ? 1 : 3
    const { data: newMatch, error: matchError } = await supabase.from('matches').insert({
      scrim_post_id: app.scrim_post_id,
      team1_id: scrimPost.team_id,
      team2_id: applyApp.applying_team_id,
      match_date: scrimPost.preferred_date,
      status: 'scheduled',
      format,
    }).select('id').single()

    if (matchError || !newMatch?.id) {
      return NextResponse.json({ error: '매치 생성 실패: ' + matchError?.message }, { status: 500 })
    }

    const mapRows = Array.from({ length: mapCount }, (_, i) => ({
      match_id: newMatch.id,
      map_number: i + 1,
      map_name: 'TBD',
      team1_score: 0,
      team2_score: 0,
    }))
    await Promise.all([
      supabase.from('match_maps').insert(mapRows),
      supabase.from('scrim_applications').update({ match_id: newMatch.id }).eq('id', appId),
    ])

    // 양 팀 이름 + Discord ID 수집
    const [{ data: team1Data }, { data: team2Data }, { data: team1Members }, { data: team2Members }] = await Promise.all([
      supabase.from('teams').select('name, abbreviation').eq('id', scrimPost.team_id).single(),
      supabase.from('teams').select('name, abbreviation').eq('id', applyApp.applying_team_id).single(),
      supabase.from('team_members').select('users(discord_id)').eq('team_id', scrimPost.team_id),
      supabase.from('team_members').select('users(discord_id)').eq('team_id', applyApp.applying_team_id),
    ])

    const extractIds = (members: any[]) =>
      members.flatMap((m: any) => {
        const u = Array.isArray(m.users) ? m.users[0] : m.users
        return u?.discord_id ? [u.discord_id] : []
      })

    const team1Ids = extractIds(team1Members ?? [])
    const team2Ids = extractIds(team2Members ?? [])
    const t1Label = team1Data?.abbreviation ?? team1Data?.name ?? '팀1'
    const t2Label = team2Data?.abbreviation ?? team2Data?.name ?? '팀2'

    // 팀별 Discord 음성채널 각각 생성
    const { team1ChannelId, team2ChannelId } = await createScrimVoiceChannels(t1Label, t2Label, team1Ids, team2Ids)
    const channelStr = [team1ChannelId, team2ChannelId].filter(Boolean).join(',')
    if (channelStr) {
      await supabase.from('matches').update({ discord_channel_id: channelStr }).eq('id', newMatch.id)
    }

    // 신청 팀 캡틴에게 수락 알림
    const { data: applyingTeamData } = await supabase.from('teams').select('captain_id').eq('id', applyApp.applying_team_id).single()
    if (applyingTeamData?.captain_id) {
      await notify(applyingTeamData.captain_id, 'scrim_accepted', '스크림 신청이 수락됐어요!', '매치가 생성됐어요. 확인해보세요.', `/matches/${newMatch.id}`)
    }

    return NextResponse.json({ success: true, matchId: newMatch.id })
  }

  // 거절 알림
  const { data: applyAppForReject } = await supabase.from('scrim_applications').select('applying_team_id').eq('id', appId).single()
  if (applyAppForReject?.applying_team_id) {
    const { data: applyingTeamData } = await supabase.from('teams').select('captain_id').eq('id', applyAppForReject.applying_team_id).single()
    if (applyingTeamData?.captain_id) {
      await notify(applyingTeamData.captain_id, 'scrim_rejected', '스크림 신청이 거절됐어요', '다른 팀에게 신청해보세요.', null)
    }
  }

  return NextResponse.json({ success: true })
}
