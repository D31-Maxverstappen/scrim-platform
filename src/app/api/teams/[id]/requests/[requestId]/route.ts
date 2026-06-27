import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalcTierAvg } from '@/lib/tierUtils'
import { assignDiscordRole } from '@/lib/discord'
import { isCoachAccount } from '@/lib/account'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, requestId: string }> }) {
  const { id: teamId, requestId } = await params
  const { action, role } = await req.json() // action: 'accept' | 'reject'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 팀장인지 확인
  const { data: team } = await supabase.from('teams').select('captain_id, discord_role_id').eq('id', teamId).single()
  if (team?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  // 신청 정보
  const { data: request } = await supabase.from('team_join_requests').select('user_id').eq('id', requestId).single()
  if (!request?.user_id) return NextResponse.json({ error: '신청을 찾을 수 없어요.' }, { status: 404 })
  const requesterId = request.user_id

  if (action === 'accept') {
    // 코치는 다팀 허용 → 1팀 제약·중복신청 정리 건너뜀, role은 'coach' 고정
    const coach = await isCoachAccount(supabase, requesterId)

    if (!coach) {
      // 이미 다른 팀에 소속됐는지 확인
      const { data: alreadyMember } = await supabase
        .from('team_members').select('id').eq('user_id', requesterId).maybeSingle()
      if (alreadyMember) {
        // 신청을 자동 취소 처리하고 에러 반환
        await supabase.from('team_join_requests').update({ status: 'rejected' }).eq('id', requestId)
        return NextResponse.json({ error: '해당 유저는 이미 다른 팀에 소속되어 있어요. 신청이 자동 취소되었습니다.' }, { status: 400 })
      }
    }

    await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: requesterId,
      role: coach ? 'coach' : (role ?? 'player'),
    })
    await supabase.from('team_join_requests').update({ status: 'accepted' }).eq('id', requestId)

    if (!coach) {
      // 선수: 다른 팀 pending 신청 전부 취소 (1팀 제약)
      await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('user_id', requesterId)
        .eq('status', 'pending')
        .neq('id', requestId)

      // 선수에게 온 다른 팀 pending 초대도 전부 취소
      await supabase
        .from('team_invites')
        .update({ status: 'declined' })
        .eq('invited_user_id', requesterId)
        .eq('status', 'pending')
    }

    await recalcTierAvg(supabase, teamId)

    // Discord 팀 역할 부여
    if (team?.discord_role_id) {
      const { data: memberProfile } = await supabase
        .from('users').select('discord_id').eq('id', requesterId).single()
      if (memberProfile?.discord_id) {
        await assignDiscordRole(memberProfile.discord_id, team.discord_role_id).catch(() => {})
      }
    }
  } else {
    await supabase.from('team_join_requests').update({ status: 'rejected' }).eq('id', requestId)
  }

  return NextResponse.json({ success: true })
}
