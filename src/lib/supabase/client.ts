import { createBrowserClient } from '@supabase/ssr'

const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.split('; ').find(c => c.startsWith(key + '='))
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Lax`
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=; path=/; max-age=0`
  },
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: 'pkce', storage: cookieStorage } }
  )
}
