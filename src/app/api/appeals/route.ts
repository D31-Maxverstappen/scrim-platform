import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const { email, reason } = await req.json()

  if (!email || !reason) {
    return NextResponse.json({ error: '이메일과 사유를 모두 입력해주세요.' }, { status: 400 })
  }
  if (reason.length < 20) {
    return NextResponse.json({ error: '사유를 20자 이상 작성해주세요.' }, { status: 400 })
  }

  // 이메일로 유저 찾기
  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find((u) => u.email === email.trim().toLowerCase())
  if (!authUser) {
    return NextResponse.json({ error: '해당 이메일로 가입된 계정이 없습니다.' }, { status: 404 })
  }

  // 정지된 계정인지 확인
  const { data: profile } = await admin.from('users').select('suspended').eq('id', authUser.id).single()
  if (!profile?.suspended) {
    return NextResponse.json({ error: '정지되지 않은 계정입니다.' }, { status: 400 })
  }

  // 이미 대기 중인 이의 신청이 있는지 확인
  const { data: existing } = await admin
    .from('appeals')
    .select('id')
    .eq('user_id', authUser.id)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 검토 중인 이의 신청이 있습니다.' }, { status: 409 })
  }

  const { error } = await admin.from('appeals').insert({
    email: email.trim().toLowerCase(),
    user_id: authUser.id,
    reason: reason.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
