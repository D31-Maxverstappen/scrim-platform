import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  return NextResponse.json({ success: true })
}
