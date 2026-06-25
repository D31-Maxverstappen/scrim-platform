'use client'

import { useState } from 'react'

export default function TeamPageTabs({
  overviewContent,
  statsContent,
  matchesContent,
  chatContent,
}: {
  overviewContent: React.ReactNode
  statsContent: React.ReactNode
  matchesContent: React.ReactNode
  chatContent: React.ReactNode
}) {
  const [tab, setTab] = useState('overview')

  const TABS = [
    { key: 'overview', label: '개요' },
    { key: 'stats', label: '통계' },
    { key: 'matches', label: '매치' },
    { key: 'chat', label: '채팅' },
  ]

  const content =
    tab === 'overview' ? overviewContent :
    tab === 'stats' ? statsContent :
    tab === 'matches' ? matchesContent :
    chatContent

  return (
    <>
      {/* 탭 바 */}
      <div className="border-b border-white/10 mb-6">
        <div className="flex">
          {TABS.map((tab_item) => (
            <button
              key={tab_item.key}
              onClick={() => setTab(tab_item.key)}
              className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition ${
                tab === tab_item.key
                  ? 'border-[#00D2BE] text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab_item.label}
            </button>
          ))}
        </div>
      </div>
      {content}
    </>
  )
}
