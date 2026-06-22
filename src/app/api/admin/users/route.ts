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
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

export async function PATCH(req: NextRequest) {
  const adminUser = await checkAdmin()
  if (!adminUser) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { userId, action } = await req.json()
  if (!userId || !action) return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })

  const suspend = action === 'suspend'
  const { error } = await admin.from('users').update({
    suspended: suspend,
    suspended_at: suspend ? new Date().toISOString() : null,
  }).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const adminUser = await checkAdmin()
  if (!adminUser) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
