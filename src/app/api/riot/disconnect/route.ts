import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 라이엇 연동 해제 — 본인 계정의 라이엇/발로란트 수집 데이터 전부 삭제
export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { error } = await supabase
    .from('users')
    .update({
      riot_puuid: null,
      riot_gamename: null,
      riot_tagline: null,
      val_gamename: null,
      val_tagline: null,
      val_tier: null,
      tier: null,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
