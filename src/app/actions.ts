'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createTeamAction(formData: FormData) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const game_type = formData.get('game_type') as string
  const tier_avg = formData.get('tier_avg') as string

  // users 테이블 upsert
  await supabase.from('users').upsert({
    id: user.id,
    summoner_name: user.user_metadata?.full_name ?? user.email ?? '유저',
    game_type: game_type as 'valorant' | 'lol',
  }, { onConflict: 'id' })

  // 팀 생성
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name,
      game_type,
      captain_id: user.id,
      tier_avg: tier_avg || null,
    })
    .select()
    .single()

  if (teamError) {
    if (teamError.message.includes('unique')) return { error: '이미 존재하는 팀 이름이에요!' }
    return { error: teamError.message }
  }

  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    role: 'captain',
  })

  redirect('/teams')
}

export async function createScrimAction(formData: FormData) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const game_type = formData.get('game_type') as string
  const preferred_date = formData.get('preferred_date') as string
  const preferred_time = formData.get('preferred_time') as string
  const note = formData.get('note') as string

  const { data: myTeam } = await supabase
    .from('teams')
    .select('id')
    .eq('captain_id', user.id)
    .eq('game_type', game_type)
    .single()

  if (!myTeam) return { error: '해당 게임의 팀이 없어요. 먼저 팀을 만들어주세요!' }

  const preferredDate = preferred_date && preferred_time
    ? `${preferred_date}T${preferred_time}:00`
    : null

  const { error: postError } = await supabase
    .from('scrim_posts')
    .insert({
      team_id: myTeam.id,
      game_type,
      preferred_date: preferredDate,
      note: note || null,
      status: 'open',
    })

  if (postError) return { error: postError.message }

  redirect('/scrims')
}
