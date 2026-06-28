'use client'

import { useState, Fragment } from 'react'

export default function TeamPageTabs({
  overviewContent,
  statsContent,
  matchesContent,
  chatContent,
  playbookContent,
  showPlaybook = false,
}: {
  overviewContent: React.ReactNode
  statsContent: React.ReactNode
  matchesContent: React.ReactNode
  chatContent: React.ReactNode
  playbookContent?: React.ReactNode
  showPlaybook?: boolean
}) {
  const [tab, setTab] = useState('overview')

  const TABS = [
    { key: 'overview', label: '개요' },
    { key: 'stats', label: '통계' },
    { key: 'matches', label: '매치' },
    ...(showPlaybook ? [{ key: 'playbook', label: '전략 노트' }] : []),
    { key: 'chat', label: '채팅' },
  ]

  // 활성 탭 콘텐츠
  const content =
    tab === 'overview' ? overviewContent :
    tab === 'stats' ? statsContent :
    tab === 'matches' ? matchesContent :
    tab === 'playbook' ? playbookContent :
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
      {/* content는 서버 컴포넌트에서 prop으로 넘어온 엘리먼트 → 배열 위치에서 key 경고가 나므로
          단일 자식이 되도록 keyed Fragment로 감싼다(추가 DOM 없음). */}
      <Fragment key="tab-content">{content}</Fragment>
    </>
  )
}
