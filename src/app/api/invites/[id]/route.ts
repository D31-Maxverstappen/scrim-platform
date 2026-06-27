import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalcTierAvg } from '@/lib/tierUtils'
import { assignDiscordRole } from '@/lib/discord'
import { isCoachAccount } from '@/lib/account'

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
    // 코치는 다팀 허용 → 1팀 제약·중복 정리 건너뜀, role 'coach'
    const coach = await isCoachAccount(supabase, user.id)

    if (!coach) {
      const { data: alreadyMember } = await supabase.from('team_members').select('id').eq('user_id', user.id).maybeSingle()
      if (alreadyMember) return NextResponse.json({ error: '이미 다른 팀에 소속되어 있어요.' }, { status: 400 })
    }

    await supabase.from('team_members').insert({ team_id: invite.team_id, user_id: user.id, role: coach ? 'coach' : 'player' })
    await supabase.from('team_invites').update({ status: 'accepted' }).eq('id', id)

    if (!coach) {
      // 선수: 다른 팀 pending 신청 전부 취소
      await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      // 선수: 다른 팀 pending 초대 전부 취소
      await supabase
        .from('team_invites')
        .update({ status: 'declined' })
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .neq('id', id)
    }

    // 팀 평균 티어 갱신
    await recalcTierAvg(supabase, invite.team_id)

    // Discord 역할 부여
    const { data: team } = await supabase.from('teams').select('discord_role_id').eq('id', invite.team_id).single()
    const { data: profile } = await supabase.from('users').select('discord_id').eq('id', user.id).single()
    if (team?.discord_role_id && profile?.discord_id) {
      await assignDiscordRole(profile.discord_id, team.discord_role_id).catch(() => {})
    }

    return NextResponse.json({ success: true, action })
  }

  await supabase.from('team_invites').update({ status: action === 'accept' ? 'accepted' : 'declined' }).eq('id', id)

  return NextResponse.json({ success: true, action })
}
