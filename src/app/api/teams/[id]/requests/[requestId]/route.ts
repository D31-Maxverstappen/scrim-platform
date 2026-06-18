import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalcTierAvg } from '@/lib/tierUtils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, requestId: string }> }) {
  const { id: teamId, requestId } = await params
  const { action, role } = await req.json() // action: 'accept' | 'reject'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 팀장인지 확인
  const { data: team } = await supabase.from('teams').select('captain_id').eq('id', teamId).single()
  if (team?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  // 신청 정보
  const { data: request } = await supabase.from('team_join_requests').select('user_id').eq('id', requestId).single()
  if (!request) return NextResponse.json({ error: '신청을 찾을 수 없어요.' }, { status: 404 })

  if (action === 'accept') {
    await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: request.user_id,
      role: role ?? 'player',
    })
    await supabase.from('team_join_requests').update({ status: 'accepted' }).eq('id', requestId)
    await recalcTierAvg(supabase, teamId)
  } else {
    await supabase.from('team_join_requests').update({ status: 'rejected' }).eq('id', requestId)
  }

  return NextResponse.json({ success: true })
}
