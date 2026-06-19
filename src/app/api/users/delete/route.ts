import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 팀 캡틴이면 팀 먼저 삭제 또는 양도 필요 - 일단 멤버만 제거
  await admin.from('team_members').delete().eq('user_id', user.id)
  await admin.from('users').delete().eq('id', user.id)
  await admin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
