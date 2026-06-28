import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 전략 노트 삭제. RLS(team_notes_delete_own)가 본인 글만 삭제 허용.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { error } = await supabase.from('team_notes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: '삭제할 수 없어요.' }, { status: 403 })
  return NextResponse.json({ ok: true })
}
