'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatKST } from '@/lib/datetime'

export type TeamNote = {
  id: string
  content: string
  created_at: string
  author_id: string | null
  author: { val_gamename: string | null; riot_gamename: string | null; avatar_url: string | null } | null
}

function authorName(n: TeamNote) {
  return n.author?.val_gamename ?? n.author?.riot_gamename ?? '(탈퇴한 멤버)'
}

export default function TeamNotes({
  notes, teamId, matchId = null, currentUserId,
}: {
  notes: TeamNote[]
  teamId: string
  matchId?: string | null
  currentUserId: string
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const text = content.trim()
    if (!text || busy) return
    setBusy(true); setError('')
    const res = await fetch('/api/team-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, matchId, content: text }),
    })
    setBusy(false)
    if (!res.ok) { setError('저장에 실패했어요. 다시 시도해 주세요.'); return }
    setContent('')
    router.refresh()
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/team-notes/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 작성 */}
      <div className="bg-[#13131f] border border-white/10 rounded p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={matchId ? '이 매치의 전략·피드백을 남겨보세요 (우리 팀만 봐요)' : '맵별 전략 등 팀 전략 노트를 기록하세요 (우리 팀만 봐요)'}
          rows={3}
          className="w-full bg-[#0d0d18] border border-white/10 rounded px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE]/50 transition resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          {error
            ? <span className="text-red-400 text-xs">{error}</span>
            : <span className="text-slate-600 text-[11px]">🔒 상대 팀에는 보이지 않아요</span>}
          <button
            onClick={submit}
            disabled={!content.trim() || busy}
            className="bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded transition"
          >
            {busy ? '저장 중...' : '노트 추가'}
          </button>
        </div>
      </div>

      {/* 목록 */}
      {notes.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">아직 노트가 없어요. 첫 전략을 남겨보세요.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map((n) => {
            const mine = n.author_id === currentUserId
            const av = n.author?.avatar_url
            return (
              <div key={n.id} className="bg-[#13131f] border border-white/10 rounded px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 shrink-0 overflow-hidden rounded bg-[#0d0d18]">
                    {av
                      ? <img src={av} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-white/30">{authorName(n)[0]?.toUpperCase() ?? '?'}</div>}
                  </div>
                  <span className="text-white text-xs font-bold">{authorName(n)}</span>
                  <span className="text-slate-600 text-[11px]">
                    {formatKST(n.created_at, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {mine && (
                    <button onClick={() => remove(n.id)}
                      className="ml-auto text-slate-600 hover:text-red-400 text-[11px] transition">삭제</button>
                  )}
                </div>
                <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{n.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
