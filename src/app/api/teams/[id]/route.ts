import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 캡틴만 삭제 가능
  const { data: team } = await supabase.from('teams').select('captain_id').eq('id', teamId).single()
  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
  if (team.captain_id !== user.id) return NextResponse.json({ error: '팀장만 삭제할 수 있어요.' }, { status: 403 })

  const { data: scrimPosts } = await supabase.from('scrim_posts').select('id').eq('team_id', teamId)
  const scrimIds = (scrimPosts ?? []).map((s: any) => s.id)
  if (scrimIds.length > 0) {
    const { error: e1 } = await supabase.from('scrim_applications').delete().in('scrim_post_id', scrimIds)
    if (e1) return NextResponse.json({ error: 'scrim_applications: ' + e1.message }, { status: 500 })
  }

  const { error: e2 } = await supabase.from('team_join_requests').delete().eq('team_id', teamId)
  if (e2) return NextResponse.json({ error: 'team_join_requests: ' + e2.message }, { status: 500 })

  const { error: e3 } = await supabase.from('team_members').delete().eq('team_id', teamId)
  if (e3) return NextResponse.json({ error: 'team_members: ' + e3.message }, { status: 500 })

  const { error: e4 } = await supabase.from('scrim_posts').delete().eq('team_id', teamId)
  if (e4) return NextResponse.json({ error: 'scrim_posts: ' + e4.message }, { status: 500 })

  const { error: e5 } = await supabase.from('teams').delete().eq('id', teamId)
  if (e5) return NextResponse.json({ error: 'teams: ' + e5.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
