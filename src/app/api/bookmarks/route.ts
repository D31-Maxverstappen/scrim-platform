import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TYPES = ['scrim_post', 'team']

// 즐겨찾기 토글: 있으면 삭제, 없으면 추가
export async function POST(req: NextRequest) {
  const { type, id } = await req.json()
  if (!TYPES.includes(type) || !id) {
    return NextResponse.json({ error: '잘못된 요청이에요.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', type)
    .eq('target_id', id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bookmarked: false })
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, target_type: type, target_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookmarked: true })
}
