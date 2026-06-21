'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createDiscordRole, assignDiscordRole } from '@/lib/discord'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
  const abbreviation = (formData.get('abbreviation') as string)?.toUpperCase().trim()
  const game_type = formData.get('game_type') as string
  const tier_avg = formData.get('tier_avg') as string

  if (!abbreviation || abbreviation.length < 2 || abbreviation.length > 5) {
    return { error: '팀 약자는 2~5글자로 입력해주세요. (예: PRX, T1, GEN)' }
  }

  // 이미 팀에 소속됐는지 확인 (1팀 제한)
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existingMembership) return { error: '이미 팀에 소속되어 있어요. 기존 팀을 탈퇴하거나 삭제한 뒤 만들 수 있어요.' }

  // users 테이블 upsert
  await supabase.from('users').upsert({
    id: user.id,
    game_type: 'valorant',
  }, { onConflict: 'id' })

  // 팀 생성
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name,
      abbreviation,
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

  const { error: memberError } = await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    role: 'captain',
  })

  if (memberError) {
    await supabase.from('teams').delete().eq('id', team.id)
    return { error: '팀 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
  }

  // Discord 팀 역할 생성 + 캡틴에게 부여
  try {
    const teamColor = 0xFF4655
    const discordRoleId = await createDiscordRole(abbreviation, teamColor)
    if (discordRoleId) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      await admin.from('teams').update({ discord_role_id: discordRoleId }).eq('id', team.id)

      const { data: captainProfile } = await supabase.from('users').select('discord_id').eq('id', user.id).single()
      if (captainProfile?.discord_id) {
        await assignDiscordRole(captainProfile.discord_id, discordRoleId)
      }
    }
  } catch {}

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
  const format = (formData.get('format') as string) || 'BO3'
  const server = (formData.get('server') as string) || 'KR'

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
      server,
      status: 'open',
      format,
    })

  if (postError) return { error: postError.message }

  redirect('/scrims')
}

export async function updateCountryAction(country: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  await supabase.from('users').update({ country: country || null }).eq('id', user.id)
}
