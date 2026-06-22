import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { type, targetId, userId } = await req.json()

  if (!type || !targetId || !userId) {
    return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })
  }

  // 기존 초대 링크가 있으면 재사용
  const { data: existing } = await admin
    .from('invite_links')
    .select('token')
    .eq('type', type)
    .eq('target_id', targetId)
    .eq('created_by', userId)
    .single()

  if (existing) return NextResponse.json({ token: existing.token })

  const token = randomUUID()
  const { data, error } = await admin
    .from('invite_links')
    .insert({ type, target_id: targetId, created_by: userId, token })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token: data.token })
}
