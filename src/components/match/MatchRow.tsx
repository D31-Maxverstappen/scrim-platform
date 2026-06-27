'use client'
import { useState } from 'react'
import { formatKST } from '@/lib/datetime'
import type { ValMatch, ValMatchPlayer } from '@/lib/valorantMatchMock'

const WIN_COLOR = '#22c55e'
const LOSS_COLOR = '#ff4655'
const MODE_LABEL_COLOR: Record<string, string> = { 경쟁전: '#E8B84B', 스크림: '#00D2BE', 일반전: '#94a3b8' }

const fmtDate = (iso: string) => formatKST(iso, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

function PlayerRow({ p }: { p: ValMatchPlayer }) {
  return (
    <div className={`grid grid-cols-12 gap-2 items-center px-3 py-1.5 text-xs ${p.isMe ? 'bg-[#00D2BE]/10' : 'hover:bg-white/[0.02]'}`}>
      <div className="col-span-5 flex items-center gap-2 min-w-0">
        <span className="w-6 h-6 shrink-0 rounded bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white font-black text-[11px]">{p.agent[0]}</span>
        <span className={`truncate ${p.isMe ? 'text-[#00D2BE] font-bold' : 'text-slate-300'}`}>{p.name}{p.tag && <span className="text-slate-600 font-normal">#{p.tag}</span>}</span>
      </div>
      <span className="col-span-4 text-center text-slate-300">{p.kills} <span className="text-slate-600">/</span> <span className="text-[#ff6b76]">{p.deaths}</span> <span className="text-slate-600">/</span> {p.assists}</span>
      <span className="col-span-2 text-center text-white font-bold">{p.acs}</span>
      <span className="col-span-1 text-right text-slate-500">{p.hsPercent}%</span>
    </div>
  )
}

function TeamLabel({ label, win, rounds }: { label: string; win: boolean; rounds: number }) {
  const c = win ? WIN_COLOR : LOSS_COLOR
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.02] border-l-2" style={{ borderColor: c }}>
      <span className="text-[11px] font-bold" style={{ color: c }}>{label} · {win ? '승' : '패'}</span>
      <span className="text-[11px] text-slate-400 font-black">{rounds}</span>
    </div>
  )
}

export default function MatchRow({ m }: { m: ValMatch }) {
  const [open, setOpen] = useState(false)
  const accent = m.win ? WIN_COLOR : LOSS_COLOR
  const kda = ((m.kills + m.assists) / (m.deaths || 1)).toFixed(2)
  const blue = m.players.filter((p) => p.team === 'blue')
  const red = m.players.filter((p) => p.team === 'red')

  return (
    <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden hover:border-white/15 transition">
      {/* 요약 행 (클릭 토글) */}
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-stretch text-left">
        <div className="w-1 shrink-0" style={{ background: accent }} />
        <div className="flex-1 flex items-center gap-4 px-4 py-3 flex-wrap sm:flex-nowrap">
          <div className="w-20 shrink-0">
            <p className="font-black text-sm" style={{ color: accent }}>{m.win ? '승리' : '패배'}</p>
            <p className="text-[11px] mt-0.5" style={{ color: MODE_LABEL_COLOR[m.mode] ?? '#94a3b8' }}>{m.mode}</p>
          </div>

          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 shrink-0 rounded bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white font-black text-sm">{m.agent[0]}</div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{m.agent}</p>
              <p className="text-slate-500 text-xs truncate">{m.map} · {m.agentRole}</p>
            </div>
            {m.mvp && (
              <span className="shrink-0 text-[11px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(232,184,75,0.15)', color: '#E8B84B' }}>MVP</span>
            )}
          </div>

          <div className="text-center shrink-0 w-16">
            <p className="text-sm font-black">
              <span style={{ color: m.win ? WIN_COLOR : '#cbd5e1' }}>{m.roundsWon}</span>
              <span className="text-slate-600"> : </span>
              <span style={{ color: !m.win ? LOSS_COLOR : '#cbd5e1' }}>{m.roundsLost}</span>
            </p>
            <p className="text-slate-600 text-[11px] mt-0.5">스코어</p>
          </div>

          <div className="text-center shrink-0 w-24">
            <p className="text-white text-sm font-bold">{m.kills} <span className="text-slate-600">/</span> <span className="text-[#ff6b76]">{m.deaths}</span> <span className="text-slate-600">/</span> {m.assists}</p>
            <p className="text-slate-600 text-[11px] mt-0.5">{kda} KDA</p>
          </div>

          <div className="text-center shrink-0 w-16 hidden sm:block">
            <p className="text-white text-sm font-bold">{m.acs}</p>
            <p className="text-slate-600 text-[11px] mt-0.5">ACS</p>
          </div>
          <div className="text-center shrink-0 w-14 hidden sm:block">
            <p className="text-white text-sm font-bold">{m.hsPercent}%</p>
            <p className="text-slate-600 text-[11px] mt-0.5">HS</p>
          </div>

          <div className="text-right shrink-0 w-28 hidden md:block">
            <p className="text-slate-400 text-xs">{fmtDate(m.playedAt)}</p>
            <p className="text-slate-600 text-[11px] mt-0.5">{m.durationMin}분</p>
          </div>

          <span className={`shrink-0 text-slate-600 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {/* 스코어보드 (펼침) */}
      {open && (
        <div className="border-t border-white/5 bg-[#0e0e16]">
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] text-slate-600 uppercase tracking-wider border-b border-white/5">
            <span className="col-span-5">플레이어</span>
            <span className="col-span-4 text-center">K / D / A</span>
            <span className="col-span-2 text-center">ACS</span>
            <span className="col-span-1 text-right">HS</span>
          </div>
          <TeamLabel label="우리 팀" win={m.win} rounds={m.roundsWon} />
          {blue.map((p, i) => <PlayerRow key={`b${i}`} p={p} />)}
          <TeamLabel label="상대 팀" win={!m.win} rounds={m.roundsLost} />
          {red.map((p, i) => <PlayerRow key={`r${i}`} p={p} />)}
        </div>
      )}
    </div>
  )
}
