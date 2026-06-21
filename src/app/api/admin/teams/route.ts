import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { notify } from '@/lib/notifications'

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

export async function DELETE(req: NextRequest) {
  const adminUser = await checkAdmin()
  if (!adminUser) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { teamId } = await req.json()
  if (!teamId) return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })

  const { data: team } = await admin.from('teams').select('name').eq('id', teamId).single()
  const { data: members } = await admin.from('team_members').select('user_id').eq('team_id', teamId)

  const { error } = await admin.from('teams').delete().eq('id', teamId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  for (const m of members ?? []) {
    await notify(m.user_id, 'team_disbanded', '팀이 해산되었습니다', `${team?.name ?? '소속 팀'}이(가) 운영 정책 위반으로 해산 처리되었습니다.`, '/')
  }

  return NextResponse.json({ ok: true })
}
