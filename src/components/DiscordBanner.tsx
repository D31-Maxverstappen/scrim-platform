'use client'

import { useEffect, useState } from 'react'

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

export default function DiscordBanner({ compact = false }: { compact?: boolean }) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/discord/invite')
      .then(r => r.json())
      .then(d => { if (d.inviteUrl) setInviteUrl(d.inviteUrl) })
      .finally(() => setLoading(false))
  }, [])

  if (compact) {
    return (
      <div className="bg-[#13131f] border border-[#5865F2]/20 rounded p-4">
        <div className="flex items-center gap-2 mb-3">
          <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Discord</p>
        </div>
        <p className="text-white text-sm font-bold mb-0.5">D31 공식 서버</p>
        <p className="text-slate-500 text-xs mb-3">공지 · 팀원 모집 · 커뮤니티</p>
        {loading ? (
          <div className="h-8 bg-white/5 rounded animate-pulse" />
        ) : inviteUrl ? (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-2 rounded transition text-xs"
          >
            <DiscordIcon className="w-3.5 h-3.5" />
            서버 참여하기
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <section className="relative z-10 px-6 pb-16 max-w-4xl mx-auto w-full">
      <div className="bg-[#1e1e2e]/80 border border-[#5865F2]/20 rounded-lg px-8 py-7 flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 bg-[#5865F2]/15 rounded-full flex items-center justify-center shrink-0">
          <DiscordIcon className="w-7 h-7 text-[#5865F2]" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-white font-bold text-lg mb-1">D31 공식 Discord 서버</p>
          <p className="text-slate-400 text-sm">스크림 공지, 팀원 모집, 커뮤니티 — 모두 디스코드에서 이어집니다.</p>
        </div>
        {loading ? (
          <div className="w-36 h-11 bg-white/5 rounded animate-pulse shrink-0" />
        ) : inviteUrl ? (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 shrink-0 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-6 py-3 rounded transition text-sm"
          >
            <DiscordIcon className="w-4 h-4" />
            서버 참여하기
          </a>
        ) : null}
      </div>
    </section>
  )
}
