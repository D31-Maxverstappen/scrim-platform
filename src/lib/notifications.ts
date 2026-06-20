import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function notify(userId: string, type: string, title: string, body: string, link: string | null) {
  await admin().from('notifications').insert({ user_id: userId, type, title, body, link })
}
