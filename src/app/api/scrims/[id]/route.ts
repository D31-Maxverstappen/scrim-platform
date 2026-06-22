import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: post } = await supabase
    .from('scrim_posts')
    .select('id, status, team_id, teams(captain_id)')
    .eq('id', id)
    .single()

  if (!post) return NextResponse.json({ error: '스크림을 찾을 수 없어요.' }, { status: 404 })
  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  if (team?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (post.status !== 'open') return NextResponse.json({ error: '이미 마감된 스크림이에요.' }, { status: 400 })

  const { preferred_date, format, server } = body
  await supabase.from('scrim_posts').update({ preferred_date, format, server }).eq('id', id)

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: post } = await supabase
    .from('scrim_posts')
    .select('id, status, team_id, teams(captain_id)')
    .eq('id', id)
    .single()

  if (!post) return NextResponse.json({ error: '스크림을 찾을 수 없어요.' }, { status: 404 })

  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  if (team?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (post.status !== 'open') return NextResponse.json({ error: '이미 마감된 스크림이에요.' }, { status: 400 })

  await supabase.from('scrim_posts').update({ status: 'cancelled' }).eq('id', id)

  // pending 신청 팀 캡틴들에게 취소 알림
  const { data: apps } = await supabase
    .from('scrim_applications')
    .select('applying_team_id, teams!applying_team_id(captain_id, name)')
    .eq('scrim_post_id', id)
    .eq('status', 'pending')

  await Promise.all(
    (apps ?? []).map((app: any) => {
      const applyingTeam = Array.isArray(app.teams) ? app.teams[0] : app.teams
      const captainId = applyingTeam?.captain_id
      if (!captainId) return
      return notify(captainId, 'scrim_cancelled', '신청한 스크림이 취소됐어요', '상대팀이 스크림 게시글을 취소했어요.', '/scrims/applied')
    })
  )

  return NextResponse.json({ success: true })
}
