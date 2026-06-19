'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()

      // PKCE: URL query param의 code를 세션으로 교환
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace('/login?error=' + encodeURIComponent(error.message))
          return
        }
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.replace('/login?error=' + encodeURIComponent(error?.message ?? 'no_session'))
        return
      }

      const user = session.user
      const discordIdentity = user.identities?.find((i: any) => i.provider === 'discord')
      const discordId = user.user_metadata?.provider_id
        ?? user.user_metadata?.sub
        ?? discordIdentity?.identity_data?.sub
        ?? discordIdentity?.id
        ?? null
      const providerToken = session.provider_token ?? null

      const discordName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
      const discordAvatar = user.user_metadata?.avatar_url ?? null

      const { data: existing } = await supabase
        .from('users')
        .select('id, riot_puuid')
        .eq('id', user.id)
        .single()

      if (!existing) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          riot_gamename: discordName,
          avatar_url: discordAvatar,
          discord_id: discordId ?? null,
          discord_access_token: providerToken,
        })
      } else {
        await supabase.from('users').update({
          discord_id: discordId ?? null,
          discord_access_token: providerToken,
        }).eq('id', user.id)
      }

      if (discordId) {
        try {
          await fetch('/api/discord/dm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discordId }),
          })
        } catch {}
      }

      router.replace(!existing || !existing.riot_puuid ? '/onboarding' : '/dashboard')
    }

    handle()
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#00D2BE] border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">로그인 처리 중...</p>
    </div>
  )
}
