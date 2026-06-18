import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalcTierAvg } from '@/lib/tierUtils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 캡틴은 탈퇴 불가 (팀 삭제로만 가능)
  const { data: team } = await supabase.from('teams').select('captain_id').eq('id', teamId).single()
  if (team?.captain_id === user.id) return NextResponse.json({ error: '캡틴은 탈퇴할 수 없어요. 팀 관리에서 팀을 삭제해주세요.' }, { status: 400 })

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcTierAvg(supabase, teamId)
  return NextResponse.json({ success: true })
}
