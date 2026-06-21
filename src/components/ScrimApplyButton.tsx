'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

export default function ScrimApplyButton({
  scrimPostId, myTeamId, existingStatus, gameType
}: {
  scrimPostId: string
  myTeamId: string | null
  existingStatus: string | null
  gameType: string
}) {
  const { lang } = useLang()
  const [status, setStatus] = useState(existingStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!myTeamId) return (
    <div className="text-center text-sm text-slate-500">
      <p>{t('scrim_no_team_msg', lang)}</p>
      <a href="/teams" className="text-[#00D2BE] hover:underline">{t('scrim_no_team_link', lang)}</a>
    </div>
  )

  if (status === 'accepted') return (
    <span className="text-xs font-bold px-5 py-2.5 rounded bg-green-500/20 text-green-400">{t('scrim_accepted', lang)}</span>
  )

  if (status === 'pending') return (
    <span className="text-xs font-bold px-5 py-2.5 rounded bg-yellow-500/20 text-yellow-400">Applied ✓</span>
  )

  const handleApply = async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/scrims/${scrimPostId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: myTeamId }),
    })
    setLoading(false)
    if (res.ok) setStatus('pending')
    else {
      const data = await res.json()
      setError(data.error ?? t('error', lang))
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleApply}
        disabled={loading}
        className="bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded transition"
      >
        {loading ? t('scrim_applying', lang) : t('scrim_apply_btn', lang)}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
