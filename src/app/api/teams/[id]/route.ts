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

  // scrim_posts id 먼저 수집 → scrim_applications 먼저 삭제
  const { data: scrimPosts } = await supabase.from('scrim_posts').select('id').eq('team_id', teamId)
  const scrimIds = (scrimPosts ?? []).map((s: any) => s.id)
  if (scrimIds.length > 0) {
    await supabase.from('scrim_applications').delete().in('scrim_id', scrimIds)
  }

  await supabase.from('team_join_requests').delete().eq('team_id', teamId)
  await supabase.from('team_members').delete().eq('team_id', teamId)
  await supabase.from('scrim_posts').delete().eq('team_id', teamId)
  await supabase.from('teams').delete().eq('id', teamId)

  return NextResponse.json({ success: true })
}
