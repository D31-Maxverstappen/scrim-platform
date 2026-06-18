import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 이미 멤버인지 확인
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: '이미 팀원이에요.' }, { status: 400 })

  // 이미 신청했는지 확인
  const { data: existingReq } = await supabase
    .from('team_join_requests')
    .select('id, status')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (existingReq?.status === 'pending') return NextResponse.json({ error: '이미 신청 중이에요.' }, { status: 400 })

  const { error } = await supabase
    .from('team_join_requests')
    .upsert({ team_id: teamId, user_id: user.id, status: 'pending' }, { onConflict: 'team_id,user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
