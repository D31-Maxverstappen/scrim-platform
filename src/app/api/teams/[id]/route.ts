import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params

  // 인증은 일반 클라이언트로
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: team } = await supabase.from('teams').select('captain_id').eq('id', teamId).single()
  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
  if (team.captain_id !== user.id) return NextResponse.json({ error: '팀장만 삭제할 수 있어요.' }, { status: 403 })

  // 실제 삭제는 RLS 우회하는 admin 클라이언트로
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 스크림 포스트 ID 수집
  const { data: scrimPosts } = await admin.from('scrim_posts').select('id').eq('team_id', teamId)
  const scrimIds = (scrimPosts ?? []).map((s: any) => s.id)

  // 연관 매치 ID 수집
  const { data: teamMatches } = await admin.from('matches').select('id').or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
  const matchIds = (teamMatches ?? []).map((m: any) => m.id)

  if (scrimIds.length > 0) {
    const { data: scrimMatches } = await admin.from('matches').select('id').in('scrim_post_id', scrimIds)
    scrimMatches?.forEach((m: any) => { if (!matchIds.includes(m.id)) matchIds.push(m.id) })
  }

  // 순서대로 삭제
  if (matchIds.length > 0) {
    const { error: e } = await admin.from('match_maps').delete().in('match_id', matchIds)
    if (e) return NextResponse.json({ error: 'match_maps: ' + e.message }, { status: 500 })

    const { error: e2 } = await admin.from('matches').delete().in('id', matchIds)
    if (e2) return NextResponse.json({ error: 'matches: ' + e2.message }, { status: 500 })
  }

  const { error: e3 } = await admin.from('scrim_applications').delete().eq('applying_team_id', teamId)
  if (e3) return NextResponse.json({ error: 'scrim_applications: ' + e3.message }, { status: 500 })

  if (scrimIds.length > 0) {
    const { error: e4 } = await admin.from('scrim_applications').delete().in('scrim_post_id', scrimIds)
    if (e4) return NextResponse.json({ error: 'scrim_applications(post): ' + e4.message }, { status: 500 })
  }

  const { error: e5 } = await admin.from('team_join_requests').delete().eq('team_id', teamId)
  if (e5) return NextResponse.json({ error: 'team_join_requests: ' + e5.message }, { status: 500 })

  const { error: e6 } = await admin.from('team_messages').delete().eq('team_id', teamId)
  if (e6) return NextResponse.json({ error: 'team_messages: ' + e6.message }, { status: 500 })

  const { error: e7 } = await admin.from('team_members').delete().eq('team_id', teamId)
  if (e7) return NextResponse.json({ error: 'team_members: ' + e7.message }, { status: 500 })

  const { error: e8 } = await admin.from('scrim_posts').delete().eq('team_id', teamId)
  if (e8) return NextResponse.json({ error: 'scrim_posts: ' + e8.message }, { status: 500 })

  const { error: e9 } = await admin.from('teams').delete().eq('id', teamId)
  if (e9) return NextResponse.json({ error: 'teams: ' + e9.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
