'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SuspendedWatcher({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/me/suspended')
        if (!res.ok) return
        const { suspended } = await res.json()
        if (suspended) {
          const supabase = createClient()
          await supabase.auth.signOut()
          router.push(`/suspended?uid=${userId}`)
        }
      } catch {}
    }

    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [userId, router])

  return null
}
