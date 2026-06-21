import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const admin = getAdmin()
  const { data: post } = await admin.from('recruitment_posts').select('user_id').eq('id', id).single()
  if (!post || post.user_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const { status } = await req.json()
  await admin.from('recruitment_posts').update({ status }).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const admin = getAdmin()
  const { data: post } = await admin.from('recruitment_posts').select('user_id').eq('id', id).single()
  if (!post || post.user_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  await admin.from('recruitment_posts').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
