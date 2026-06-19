import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params
  const { action } = await req.json() // 'accept' | 'reject'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 신청 정보 가져오기
  const { data: app } = await supabase
    .from('scrim_applications')
    .select('id, scrim_post_id, status')
    .eq('id', appId)
    .single()

  if (!app) return NextResponse.json({ error: '신청을 찾을 수 없어요.' }, { status: 404 })
  if (app.status !== 'pending') return NextResponse.json({ error: '이미 처리된 신청이에요.' }, { status: 400 })

  // 스크림 포스트의 팀 캡틴인지 확인
  const { data: post } = await supabase
    .from('scrim_posts')
    .select('team_id, teams(captain_id)')
    .eq('id', app.scrim_post_id)
    .single()

  const captain = (Array.isArray(post?.teams) ? post?.teams[0] : post?.teams) as { captain_id: string } | null
  if (captain?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'
  await supabase.from('scrim_applications').update({ status: newStatus }).eq('id', appId)

  // 수락 시 스크림 상태를 matched로 변경
  if (action === 'accept') {
    await supabase.from('scrim_posts').update({ status: 'matched' }).eq('id', app.scrim_post_id)
  }

  return NextResponse.json({ success: true })
}
