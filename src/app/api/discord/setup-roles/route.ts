import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createDiscordRole } from '@/lib/discord'

const BASE_ROLES = [
  { name: 'D31 Member',      color: 0x00D2BE },
  { name: 'VALORANT Player', color: 0xFF4655 },
  { name: 'VAL Iron',        color: 0x6b7280 },
  { name: 'VAL Bronze',      color: 0x92400e },
  { name: 'VAL Silver',      color: 0x94a3b8 },
  { name: 'VAL Gold',        color: 0xf59e0b },
  { name: 'VAL Platinum',    color: 0x2dd4bf },
  { name: 'VAL Diamond',     color: 0x60a5fa },
  { name: 'VAL Ascendant',   color: 0x34d399 },
  { name: 'VAL Immortal',    color: 0xfb7185 },
  { name: 'VAL Radiant',     color: 0xfef08a },
]

export async function POST() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 이미 생성된 역할 확인
  const { data: existing } = await admin.from('discord_roles').select('name')
  const existingNames = new Set((existing ?? []).map((r: any) => r.name))

  const results: { name: string; status: string }[] = []

  for (const role of BASE_ROLES) {
    if (existingNames.has(role.name)) {
      results.push({ name: role.name, status: 'already exists' })
      continue
    }
    const roleId = await createDiscordRole(role.name, role.color)
    if (roleId) {
      await admin.from('discord_roles').upsert({ name: role.name, discord_role_id: roleId })
      results.push({ name: role.name, status: 'created' })
    } else {
      results.push({ name: role.name, status: 'failed' })
    }
    // Discord rate limit 방지
    await new Promise(r => setTimeout(r, 300))
  }

  return NextResponse.json({ success: true, results })
}
