'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Supabase 클라이언트 초기화 전에 hash 캡처
function captureHashParams() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.hash.substring(1))
  return {
    providerToken: params.get('provider_token'),
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
  }
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const hashParams = useRef(captureHashParams())

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()

      await new Promise(r => setTimeout(r, 500))

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.replace('/login?error=' + encodeURIComponent(error?.message ?? 'no_session'))
        return
      }

      const user = session.user
      const discordId = user.user_metadata?.provider_id
        ?? user.identities?.find((i: any) => i.provider === 'discord')?.identity_data?.sub
      const providerToken = hashParams.current.providerToken ?? session.provider_token

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
          discord_access_token: providerToken ?? null,
        })
      } else {
        await supabase.from('users').update({
          discord_id: discordId ?? null,
          discord_access_token: providerToken ?? null,
        }).eq('id', user.id)
      }

      // Discord DM으로 서버 초대 링크 전송
      if (discordId) {
        try {
          const dmRes = await fetch('/api/discord/dm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discordId }),
          })
          const dmData = await dmRes.json()
          console.log('[Discord DM]', dmRes.status, dmData)
        } catch (e) {
          console.error('[Discord DM Error]', e)
        }
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
