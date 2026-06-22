import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { notify } from '@/lib/notifications'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function PATCH(req: Request) {
  const { id, adminReply } = await req.json()

  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })

  const { data: inquiry, error } = await admin
    .from('inquiries')
    .update({ status: 'answered', admin_reply: adminReply ?? null })
    .eq('id', id)
    .select('user_id, subject')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (inquiry?.user_id) {
    await notify(
      inquiry.user_id,
      'inquiry_answered',
      '문의 답변이 도착했습니다',
      inquiry.subject ?? '문의하신 내용에 답변이 완료되었습니다.',
      '/support',
    )
  }

  return NextResponse.json({ ok: true })
}
