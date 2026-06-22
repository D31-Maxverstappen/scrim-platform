import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { userId, subject, content } = await req.json()

  if (!userId || !subject || !content || content.trim().length < 10) {
    return NextResponse.json({ error: '내용을 10자 이상 입력해 주세요.' }, { status: 400 })
  }

  const { error } = await admin.from('inquiries').insert({
    user_id: userId,
    subject,
    content: content.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
