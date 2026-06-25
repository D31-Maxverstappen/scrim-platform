'use client'

import { useEffect, useState } from 'react'

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
  </svg>
)

const FALLBACK_URL = 'https://discord.gg/d31'

export default function DiscordBanner({ compact = false }: { compact?: boolean }) {
  const [inviteUrl, setInviteUrl] = useState<string>(FALLBACK_URL)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/discord/invite')
      .then(r => r.json())
      .then(d => { if (d.inviteUrl) setInviteUrl(d.inviteUrl) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (compact) {
    return (
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">Discord</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center shrink-0">
            <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
          </div>
          <div>
            <p className="text-white text-xs font-bold">D31 공식 서버</p>
            <p className="text-slate-600 text-[10px] mt-0.5">공지 · 팀원 모집 · 커뮤니티</p>
          </div>
        </div>
        {loading ? (
          <div className="h-8 bg-white/[0.04] rounded-xl animate-pulse" />
        ) : (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-2 rounded-xl transition text-xs"
          >
            <DiscordIcon className="w-3 h-3" />
            서버 참여하기
          </a>
        )}
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
        ) : (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 shrink-0 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-6 py-3 rounded transition text-sm"
          >
            <DiscordIcon className="w-4 h-4" />
            서버 참여하기
          </a>
        )}
      </div>
    </section>
  )
}
