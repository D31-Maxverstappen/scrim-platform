import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const { targetUserId } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: team } = await supabase.from('teams').select('id, name, captain_id').eq('id', teamId).single()
  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
  if (team.captain_id !== user.id) return NextResponse.json({ error: '캡틴만 초대할 수 있어요.' }, { status: 403 })
  if (targetUserId === user.id) return NextResponse.json({ error: '자신을 초대할 수 없어요.' }, { status: 400 })

  const { data: alreadyMember } = await supabase.from('team_members').select('id').eq('team_id', teamId).eq('user_id', targetUserId).maybeSingle()
  if (alreadyMember) return NextResponse.json({ error: '이미 팀 멤버예요.' }, { status: 400 })

  const { data: existing } = await supabase.from('team_invites').select('id, status').eq('team_id', teamId).eq('invited_user_id', targetUserId).maybeSingle()
  if (existing?.status === 'pending') return NextResponse.json({ error: '이미 초대를 보냈어요.' }, { status: 400 })

  const { data: invite, error } = await supabase.from('team_invites').upsert({
    team_id: teamId,
    invited_user_id: targetUserId,
    invited_by: user.id,
    status: 'pending',
  }, { onConflict: 'team_id,invited_user_id' }).select('id').single()

  if (error || !invite) return NextResponse.json({ error: '초대 생성에 실패했어요.' }, { status: 500 })

  await notify(targetUserId, 'team_invite', `${team.name}에서 초대가 왔어요!`, '팀 초대를 확인하세요.', `/invites/${invite.id}`)

  return NextResponse.json({ success: true })
}
