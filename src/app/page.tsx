'use client'
import Link from 'next/link'

import Image from 'next/image'
import DiscordBanner from '@/components/layout/DiscordBanner'
import Reveal from '@/components/common/Reveal'
import RevealText from '@/components/common/RevealText'
import ScrollCue from '@/components/common/ScrollCue'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const games = [
  {
    name: 'VALORANT',
    color: '#ff4655',
    glow: 'rgba(255,70,85,0.4)',
    bg: 'linear-gradient(135deg, #1a0508 0%, #0d0206 100%)',
    desc: '5v5 Tactical FPS',
    href: '/valorant/dashboard',
    loginHref: '/login',
    available: true,
  },
  {
    name: '+ 추가 게임',
    color: '#374151',
    glow: 'rgba(55,65,81,0.2)',
    bg: 'linear-gradient(135deg, #0d0d14 0%, #080810 100%)',
    desc: '지원 예정',
    href: '#',
    loginHref: '#',
    available: false,
  },
]

const features = [
  {
    title: '자동 매칭',
    desc: '버튼 하나로 티어가 비슷한 상대팀을 자동으로 찾아줘요. 티어 차이 ±2단계 이내 매칭.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: '스크림 게시판',
    desc: '원하는 조건으로 공고를 올리면 상대팀이 신청합니다. 수락 시 자동으로 매칭이 생성됩니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: '선수·팀 구하기',
    desc: 'LFT/LFP 공고를 올리고 Discord 태그로 바로 연락할 수 있습니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: '리더보드',
    desc: '승률, 평균 티어, 활동량 기준으로 팀 순위를 확인하세요.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: '팀 관리',
    desc: '팀원 초대, 역할 설정, 공개/비공개 팀 운영을 지원합니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: '실시간 알림',
    desc: '매칭 신청, 수락, 초대 등 주요 이벤트를 실시간으로 알립니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-7 text-center border-b border-white/5 last:border-b-0">
      <p className="text-white font-black text-3xl mb-1">{value}</p>
      <p className="text-slate-500 text-[11px] uppercase tracking-widest">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [stats, setStats] = useState({ users: 0, teams: 0, matches: 0, manner: 100 })

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })

    Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('scrim_posts').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ]).then(([users, teams, matches, scrims]) => {
      setStats({
        users: users.count ?? 0,
        teams: teams.count ?? 0,
        matches: matches.count ?? 0,
        manner: scrims.count ?? 0,
      })
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#07070b] flex flex-col relative overflow-hidden">

      {/* 배경 - 히어로 섹션(첫 화면)만 커버 */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-screen overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=60"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={50}
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070b]/60 via-[#07070b]/70 to-[#07070b] landing-hero-overlay" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00D2BE]/8 rounded-full blur-[120px] transform-gpu" />
        {/* 폴드 하단 글로우 — "경계 너머에 콘텐츠가 더 있다"는 암시(스크롤 유도) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[760px] h-[260px] bg-[#00D2BE]/30 rounded-full blur-[90px] transform-gpu" />
      </div>

      {/* 네비바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070b]/95 border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Image src="/logo.png" alt="D31" width={112} height={112} className="object-contain" />
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 select-none">
          <span className="text-xl font-black tracking-tight text-white">D31</span>
          <span className="text-xl font-black tracking-tight text-[#00D2BE]">.GG</span>
        </Link>
        <div className="w-20" />
      </nav>

      {/* 히어로 */}
      <section className="relative z-10 flex items-center justify-center pt-32 pb-12 px-6 gap-4">

        {/* 왼쪽 스탯 */}
        <div className="hidden lg:flex flex-col w-36 shrink-0 bg-white/3 border border-white/5 rounded overflow-hidden">
          <StatCard label="가입 유저" value={stats.users} />
          <StatCard label="완료된 스크림" value={stats.matches} />
        </div>

        {/* 센터 히어로 */}
        <div className="flex flex-col items-center text-center flex-1 max-w-3xl">
          <Reveal trigger="load" delay={0}>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-green-400 text-xs font-semibold tracking-[0.3em] uppercase">Korea's First Scrim Platform</p>
            </div>
          </Reveal>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            <RevealText
              startDelay={160}
              stagger={70}
              segments={[
                { text: '스크림 · 내전', breakAfter: true },
                { text: '매칭 플랫폼', whole: true, className: 'bg-gradient-to-r from-[#00D2BE] to-[#00edd6] bg-clip-text text-transparent' },
              ]}
            />
          </h1>
          <Reveal trigger="load" delay={520}>
            <p className="text-slate-300 text-xl max-w-xl mb-12 leading-relaxed">
              실력에 맞는 팀을 찾고, 스크림을 잡고,<br />매너 점수로 신뢰를 쌓으세요.
            </p>
          </Reveal>
          <Reveal trigger="load" delay={620}>
            <div className="flex gap-3">
              <a href={loggedIn ? '/valorant/dashboard' : '/login'} className="bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold px-10 py-4 rounded transition text-base">
                {loggedIn ? '홈으로' : '로그인 / 회원가입'}
              </a>
            </div>
          </Reveal>

          {/* 기능 배지 */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              '자동 매칭', '스크림 게시판', 'LFT / LFP 모집', '팀 리더보드', '팀 관리', '실시간 알림',
            ].map((label) => (
              <span key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/8 text-slate-300 text-sm px-4 py-2 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] shrink-0" />
                {label}
              </span>
            ))}
          </div>

          {/* 스크롤 유도 — 스크롤 시작하면 페이드아웃 */}
          <ScrollCue href="#features" label="자세히 보기" />

          {/* 모바일 전용 스탯 */}
          <div className="flex lg:hidden gap-3 mt-10 w-full justify-center">
            <StatCard label="가입 유저" value={stats.users} />
            <StatCard label="등록 팀" value={stats.teams} />
            <StatCard label="완료된 스크림" value={stats.matches} />
            <StatCard label="모집 중" value={stats.manner} />
          </div>
        </div>

        {/* 오른쪽 스탯 */}
        <div className="hidden lg:flex flex-col w-36 shrink-0 bg-white/3 border border-white/5 rounded overflow-hidden">
          <StatCard label="등록 팀" value={stats.teams} />
          <StatCard label="모집 중" value={stats.manner} />
        </div>

      </section>

      {/* 게임 선택 */}
      <section className="relative z-10 px-6 pb-32 max-w-4xl mx-auto w-full">
        <p className="text-center text-slate-600 text-xs font-semibold tracking-[0.3em] uppercase mb-8">지원 게임</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {games.map((game, i) => (
            <Reveal key={game.name} delay={i * 90}>
            <a
              href={game.available ? (loggedIn ? game.href : game.loginHref) : '#'}
              style={{ background: game.bg }}
              className={`group relative flex items-center gap-6 rounded p-7 border border-white/5 transition-all duration-300 overflow-hidden ${game.available ? 'hover:border-white/10 cursor-pointer hover:scale-[1.02]' : 'cursor-default opacity-50'}`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 50%, ${game.glow} 0%, transparent 70%)` }}
              />
              <div className="relative z-10 flex-1">
                <p className="font-black text-3xl tracking-widest mb-1" style={{ color: game.color }}>{game.name}</p>
                <p className="text-slate-500 text-xs mb-4">{game.desc}</p>
                {game.available && (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded"
                    style={{ background: game.color + '22', color: game.color }}
                  >
                    스크림 찾기 →
                  </span>
                )}
              </div>
            </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 주요 기능 ── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-5xl mx-auto w-full">
        <Reveal>
          <p className="text-center text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">Features</p>
          <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-4">필요한 건 다 있어요</h2>
          <p className="text-center text-slate-500 text-sm mb-14">스크림부터 팀 관리까지, 하나의 플랫폼에서</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
            <div className="bg-[#13131f] border border-white/5 rounded p-6 hover:border-white/10 transition">
              <div className="w-12 h-12 rounded-lg bg-[#00D2BE]/15 flex items-center justify-center mb-5 text-[#00D2BE]">
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 이렇게 시작하세요 ── */}
      <section id="howto" className="relative z-10 px-6 py-24 border-t border-white/5 w-full">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p className="text-center text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">How it works</p>
            <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-16">4단계로 첫 스크림까지</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {[
              { step: '01', title: '회원가입', desc: 'Discord 계정으로 간편하게 가입하고 게임 닉네임과 티어를 등록해요.' },
              { step: '02', title: '팀 만들기', desc: '직접 팀을 만들거나 공개 팀에 가입 신청을 해요.' },
              { step: '03', title: '스크림 잡기', desc: '게시판에 공고를 올리거나 자동 매칭으로 상대를 찾아요.' },
              { step: '04', title: '결과 입력', desc: '맵별 스코어를 입력하면 전적과 승률이 자동으로 기록돼요.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 90} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#13131f] border border-white/10 flex items-center justify-center mb-4 relative z-10">
                  <span className="text-[#00D2BE] font-black text-lg">{s.step}</span>
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 자동 매칭 하이라이트 ── */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Reveal direction="left" distance={32}>
            <p className="text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">자동 매칭</p>
            <h2 className="text-white font-black text-3xl mb-5 leading-tight">상대 찾는 데<br />시간 낭비 없이</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              매칭 시작 버튼을 누르면 비슷한 티어의 팀을 자동으로 탐색해요.
              상대가 찾아지는 순간 알림이 오고 매치가 바로 생성돼요.
            </p>
            <ul className="flex flex-col gap-2">
              {['티어 차이 ±2단계 이내 자동 탐색', 'BO1 / BO3 / BO5 포맷 선택', 'KR / AS 서버 선택', '매칭 완료 시 실시간 알림'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-400 text-xs">
                  <span className="w-1 h-1 rounded-full bg-[#00D2BE] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} direction="right" scale distance={44} className="bg-[#13131f] border border-white/5 rounded p-6 flex flex-col gap-3">
            <Reveal delay={360} distance={14}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-xs font-bold">자동 매칭</span>
                <span className="text-[11px] text-slate-500">비슷한 티어 자동 탐색</span>
              </div>
            </Reveal>
            <Reveal delay={450} distance={14}>
              <div className="flex gap-2">
                {['BO1', 'BO3', 'BO5'].map((f, i) => (
                  <div key={f} className={`flex-1 py-1.5 rounded text-center text-[11px] font-bold ${i === 1 ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-500'}`}>{f}</div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={540} distance={14}>
              <div className="flex gap-2">
                {['KR', 'AS'].map((s, i) => (
                  <div key={s} className={`flex-1 py-1.5 rounded text-center text-[11px] font-bold ${i === 0 ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-500'}`}>{s}</div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={630} distance={14} className="bg-[#0d1a19] border border-[#00D2BE]/20 rounded px-4 py-3 flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] animate-pulse shrink-0" />
              <div>
                <p className="text-white text-xs font-bold">매칭 중...</p>
                <p className="text-slate-500 text-[11px]">23초 대기 중 · BO3 · KR</p>
              </div>
            </Reveal>
            <Reveal delay={720} distance={14} className="bg-[#00D2BE]/10 border border-[#00D2BE]/30 rounded px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[#00D2BE] text-xs font-black">매칭 완료!</p>
                <p className="text-slate-400 text-[11px]">PHANTOM과의 매치가 잡혔어요</p>
              </div>
              <span className="bg-[#00D2BE] text-white text-[11px] font-bold px-2.5 py-1 rounded">매치 보기 →</span>
            </Reveal>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="text-center text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">FAQ</p>
            <h2 className="text-center text-white font-black text-3xl mb-12">자주 묻는 질문</h2>
          </Reveal>
          <Reveal delay={90} className="flex flex-col gap-3">
            {[
              { q: '무료인가요?', a: '네, 완전 무료예요. 가입부터 스크림 매칭, 팀 관리까지 모든 기능이 무료예요.' },
              { q: '어떤 게임을 지원하나요?', a: '현재 VALORANT를 지원해요. 추후 다른 게임도 추가될 예정이에요.' },
              { q: '팀이 없어도 가입할 수 있나요?', a: '물론이에요. 가입 후 LFT(팀 구함) 게시판에 글을 올리거나, 공개 팀에 가입 신청을 할 수 있어요.' },
              { q: '스크림 결과는 어떻게 입력하나요?', a: '매치 페이지에서 맵별 스코어를 입력하면 자동으로 승패가 계산되고 팀 전적에 기록돼요.' },
              { q: '자동 매칭은 어떻게 작동하나요?', a: '팀 평균 티어를 기준으로 ±2단계 이내의 팀과 매칭해요. 같은 게임, 서버, 포맷을 선택한 팀 중 가장 오래 기다린 팀부터 매칭돼요.' },
              { q: 'Discord 연동은 필수인가요?', a: '필수는 아니에요. 하지만 연동하면 팀 역할이 자동 생성되고 매치 대기실 채널이 만들어져요.' },
            ].map((item) => (
              <details key={item.q} className="bg-[#13131f] border border-white/5 rounded group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <span className="text-white text-sm font-semibold">{item.q}</span>
                  <span className="text-slate-500 text-lg group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="relative z-10 px-6 py-32 border-t border-white/5 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00D2BE]/5 rounded-full blur-[100px] transform-gpu" />
        </div>
        <Reveal>
          <p className="text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-4">지금 시작하세요</p>
          <h2 className="text-white font-black text-4xl md:text-5xl mb-5">
            다음 스크림 상대,<br />여기서 찾으세요
          </h2>
          <p className="text-slate-400 text-sm mb-10">무료 · 가입 1분 · 바로 시작</p>
          <a href={loggedIn ? '/dashboard' : '/login'}
            className="inline-block bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold px-10 py-4 rounded transition text-sm">
            {loggedIn ? '대시보드로 →' : '무료로 시작하기 →'}
          </a>
        </Reveal>
      </section>

      <DiscordBanner />
    </div>
  )
}
