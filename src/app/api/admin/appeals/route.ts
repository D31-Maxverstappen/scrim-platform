import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await admin.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

export async function GET() {
  const adminUser = await checkAdmin()
  if (!adminUser) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { data, error } = await admin
    .from('appeals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const adminUser = await checkAdmin()
  if (!adminUser) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { appealId, action, adminNote } = await req.json()
  if (!appealId || !action) return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })

  const approved = action === 'approve'

  // 이의 신청 상태 업데이트
  const { data: appeal, error: appealError } = await admin
    .from('appeals')
    .update({
      status: approved ? 'approved' : 'rejected',
      admin_note: adminNote ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUser.id,
    })
    .eq('id', appealId)
    .select('user_id')
    .single()

  if (appealError) return NextResponse.json({ error: appealError.message }, { status: 500 })

  // 승인 시 정지 해제
  if (approved && appeal?.user_id) {
    await admin.from('users').update({ suspended: false, suspended_at: null }).eq('id', appeal.user_id)
  }

  return NextResponse.json({ ok: true })
}
