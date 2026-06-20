import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { action } = await req.json() // 'accept' | 'decline'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: invite } = await supabase.from('team_invites').select('id, team_id, invited_user_id, status').eq('id', id).single()
  if (!invite) return NextResponse.json({ error: '초대를 찾을 수 없어요.' }, { status: 404 })
  if (invite.invited_user_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (invite.status !== 'pending') return NextResponse.json({ error: '이미 처리된 초대예요.' }, { status: 400 })

  if (action === 'accept') {
    const { data: alreadyMember } = await supabase.from('team_members').select('id').eq('user_id', user.id).maybeSingle()
    if (alreadyMember) return NextResponse.json({ error: '이미 다른 팀에 소속되어 있어요.' }, { status: 400 })

    await supabase.from('team_members').insert({ team_id: invite.team_id, user_id: user.id, role: 'player' })
  }

  await supabase.from('team_invites').update({ status: action === 'accept' ? 'accepted' : 'declined' }).eq('id', id)

  return NextResponse.json({ success: true, action })
}
