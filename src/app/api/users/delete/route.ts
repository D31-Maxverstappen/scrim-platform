import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await admin.from('team_members').delete().eq('user_id', user.id)
  await admin.from('users').delete().eq('id', user.id)

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    // 이미 삭제된 경우도 성공 처리
    if (!deleteError.message?.includes('User not found')) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
