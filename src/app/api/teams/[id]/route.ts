import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: team } = await supabase.from('teams').select('captain_id').eq('id', teamId).single()
  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
  if (team.captain_id !== user.id) return NextResponse.json({ error: '팀장만 삭제할 수 있어요.' }, { status: 403 })

  // 이 팀이 포함된 매치 ID 수집
  const { data: matches } = await supabase
    .from('matches')
    .select('id')
    .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)

  const matchIds = (matches ?? []).map((m: any) => m.id)

  // 이 팀 스크림 포스트 ID 수집
  const { data: scrimPosts } = await supabase.from('scrim_posts').select('id').eq('team_id', teamId)
  const scrimIds = (scrimPosts ?? []).map((s: any) => s.id)

  // 스크림 포스트에 연결된 매치 ID도 수집
  if (scrimIds.length > 0) {
    const { data: scrimMatches } = await supabase
      .from('matches')
      .select('id')
      .in('scrim_post_id', scrimIds)
    scrimMatches?.forEach((m: any) => { if (!matchIds.includes(m.id)) matchIds.push(m.id) })
  }

  // 1. match_maps 삭제
  if (matchIds.length > 0) {
    const { error: e } = await supabase.from('match_maps').delete().in('match_id', matchIds)
    if (e) return NextResponse.json({ error: 'match_maps: ' + e.message }, { status: 500 })
  }

  // 2. matches 삭제
  if (matchIds.length > 0) {
    const { error: e } = await supabase.from('matches').delete().in('id', matchIds)
    if (e) return NextResponse.json({ error: 'matches: ' + e.message }, { status: 500 })
  }

  // 3. scrim_applications 삭제 (내 스크림 포스트에 온 신청 + 내 팀이 한 신청)
  const { error: e3a } = await supabase.from('scrim_applications').delete().eq('applying_team_id', teamId)
  if (e3a) return NextResponse.json({ error: 'scrim_applications(applying): ' + e3a.message }, { status: 500 })

  if (scrimIds.length > 0) {
    const { error: e3b } = await supabase.from('scrim_applications').delete().in('scrim_post_id', scrimIds)
    if (e3b) return NextResponse.json({ error: 'scrim_applications(post): ' + e3b.message }, { status: 500 })
  }

  // 4. team_join_requests 삭제
  const { error: e4 } = await supabase.from('team_join_requests').delete().eq('team_id', teamId)
  if (e4) return NextResponse.json({ error: 'team_join_requests: ' + e4.message }, { status: 500 })

  // 5. team_messages 삭제
  const { error: e5 } = await supabase.from('team_messages').delete().eq('team_id', teamId)
  if (e5) return NextResponse.json({ error: 'team_messages: ' + e5.message }, { status: 500 })

  // 6. team_members 삭제
  const { error: e6 } = await supabase.from('team_members').delete().eq('team_id', teamId)
  if (e6) return NextResponse.json({ error: 'team_members: ' + e6.message }, { status: 500 })

  // 7. scrim_posts 삭제
  const { error: e7 } = await supabase.from('scrim_posts').delete().eq('team_id', teamId)
  if (e7) return NextResponse.json({ error: 'scrim_posts: ' + e7.message }, { status: 500 })

  // 8. 팀 삭제
  const { error: e8 } = await supabase.from('teams').delete().eq('id', teamId)
  if (e8) return NextResponse.json({ error: 'teams: ' + e8.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
