import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function PATCH(req: Request) {
  const { id, adminReply } = await req.json()

  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })

  const { error } = await admin
    .from('inquiries')
    .update({ status: 'answered', admin_reply: adminReply ?? null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
