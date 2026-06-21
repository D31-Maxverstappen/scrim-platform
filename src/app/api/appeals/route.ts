import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const { userId, reason } = await req.json()

  if (!userId || !reason) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
  }
  if (reason.length < 20) {
    return NextResponse.json({ error: '사유를 20자 이상 작성해주세요.' }, { status: 400 })
  }

  // 정지된 계정인지 확인
  const { data: profile } = await admin.from('users').select('suspended').eq('id', userId).single()
  if (!profile?.suspended) {
    return NextResponse.json({ error: '정지된 계정이 아닙니다.' }, { status: 400 })
  }

  // 이미 대기 중인 이의 신청이 있는지 확인
  const { data: existing } = await admin
    .from('appeals')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 검토 중인 이의 신청이 있습니다.' }, { status: 409 })
  }

  const { error } = await admin.from('appeals').insert({
    user_id: userId,
    reason: reason.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
