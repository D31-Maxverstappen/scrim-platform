'use client'

import Image from 'next/image'
import DiscordBanner from '@/components/DiscordBanner'
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
  },
  {
    name: 'LEAGUE OF LEGENDS',
    color: '#c89b3c',
    glow: 'rgba(200,155,60,0.4)',
    bg: 'linear-gradient(135deg, #0d0e16 0%, #070810 100%)',
    desc: '5v5 Strategy MOBA',
    href: '/lol/dashboard',
    loginHref: '/login',
  },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-7 text-center border-b border-white/5 last:border-b-0">
      <p className="text-white font-black text-3xl mb-1">{value}</p>
      <p className="text-slate-500 text-[10px] uppercase tracking-widest">{label}</p>
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

      {/* 배경 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=60"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070b]/70 via-[#07070b]/60 to-[#07070b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00D2BE]/8 rounded-full blur-[120px]" />
      </div>

      {/* 네비바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070b]/80 backdrop-blur border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Image src="/logo.png" alt="D31" width={112} height={112} className="object-contain" />
        <div className="hidden md:flex items-center gap-1 text-sm">
          <a href="#features" className="text-slate-400 hover:text-white px-3 py-2 transition text-xs">기능 소개</a>
          <a href="#howto" className="text-slate-400 hover:text-white px-3 py-2 transition text-xs">사용 방법</a>
          <a href="#faq" className="text-slate-400 hover:text-white px-3 py-2 transition text-xs">FAQ</a>
        </div>
        <a href={loggedIn ? '/dashboard' : '/login'} className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-4 py-2 rounded transition">
          {loggedIn ? '홈으로' : '시작하기'}
        </a>
      </nav>

      {/* 히어로 */}
      <section className="relative z-10 flex items-center justify-center pt-48 pb-24 px-6 gap-4">

        {/* 왼쪽 스탯 */}
        <div className="hidden lg:flex flex-col w-36 shrink-0 bg-white/3 border border-white/5 rounded overflow-hidden">
          <StatCard label="가입 유저" value={stats.users} />
          <StatCard label="완료된 스크림" value={stats.matches} />
        </div>

        {/* 센터 히어로 */}
        <div className="flex flex-col items-center text-center flex-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-green-400 text-xs font-semibold tracking-[0.3em] uppercase">Korea's First Scrim Platform</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            스크림 · 내전<br />
            <span className="bg-gradient-to-r from-[#00D2BE] to-[#00edd6] bg-clip-text text-transparent">매칭 플랫폼</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mb-12 leading-relaxed">
            실력에 맞는 팀을 찾고, 스크림을 잡고,<br />매너 점수로 신뢰를 쌓으세요.
          </p>
          <div className="flex gap-3">
            <a href={loggedIn ? '/dashboard' : '/login'} className="bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold px-8 py-3.5 rounded transition text-sm">
              {loggedIn ? '홈으로' : '로그인 / 회원가입'}
            </a>
            <a href="/scrims" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded transition text-sm">
              스크림 둘러보기
            </a>
          </div>

          {/* 기능 배지 */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { icon: '⚡', label: '자동 매칭' },
              { icon: '📋', label: '스크림 게시판' },
              { icon: '🔍', label: 'LFT / LFP 모집' },
              { icon: '🏆', label: '팀 리더보드' },
              { icon: '👥', label: '팀 관리' },
              { icon: '🔔', label: '실시간 알림' },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 bg-white/5 border border-white/8 text-slate-400 text-xs px-3 py-1.5 rounded-full">
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>

          {/* 스크롤 유도 */}
          <a href="#features" className="mt-12 flex flex-col items-center gap-1 text-slate-600 hover:text-slate-400 transition group">
            <span className="text-xs tracking-widest uppercase">자세히 보기</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </a>

          {/* 모바일 전용 스탯 (lg 미만) */}
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
          {games.map((game) => (
            <a
              key={game.name}
              href={loggedIn ? game.href : game.loginHref}
              style={{ background: game.bg }}
              className="group relative flex items-center gap-6 rounded p-7 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 50%, ${game.glow} 0%, transparent 70%)` }}
              />
              <div className="relative z-10 flex-1">
                <p className="font-black text-3xl tracking-widest mb-1" style={{ color: game.color }}>{game.name}</p>
                <p className="text-slate-500 text-xs mb-4">{game.desc}</p>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: game.color + '22', color: game.color }}
                >
                  스크림 찾기 →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── 주요 기능 ── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-5xl mx-auto w-full">
        <p className="text-center text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">Features</p>
        <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-4">필요한 건 다 있어요</h2>
        <p className="text-center text-slate-500 text-sm mb-14">스크림부터 팀 관리까지, 하나의 플랫폼에서</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '⚡',
              title: '자동 매칭',
              desc: '버튼 하나로 티어가 비슷한 상대팀을 자동으로 찾아줘요. 기다리는 동안 다른 걸 해도 돼요.',
              color: '#00D2BE',
            },
            {
              icon: '📋',
              title: '스크림 게시판',
              desc: '원하는 날짜, 포맷, 서버를 설정해서 공고를 올리면 상대팀이 신청해요. 수락하면 매치가 바로 생성돼요.',
              color: '#ff4655',
            },
            {
              icon: '🔍',
              title: '모집 게시판 (LFT/LFP)',
              desc: '팀을 찾는 선수, 선수를 찾는 팀. Discord 태그로 바로 연락할 수 있어요.',
              color: '#c89b3c',
            },
            {
              icon: '🏆',
              title: '리더보드',
              desc: '팀 승률, 평균 티어, 스크림 활동량 기준으로 순위를 확인할 수 있어요.',
              color: '#a78bfa',
            },
            {
              icon: '👥',
              title: '팀 관리',
              desc: '멤버 초대, 역할 설정, 공개/초대 전용 전환. 팀 운영에 필요한 모든 것을 한 곳에서.',
              color: '#60a5fa',
            },
            {
              icon: '🔔',
              title: '실시간 알림',
              desc: '스크림 신청, 수락, 매칭 완료, 팀 초대. 중요한 순간을 놓치지 않아요.',
              color: '#34d399',
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#13131f] border border-white/5 rounded p-5 hover:border-white/10 transition">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 이렇게 시작하세요 ── */}
      <section id="howto" className="relative z-10 px-6 py-24 border-t border-white/5 w-full">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">How it works</p>
          <h2 className="text-center text-white font-black text-3xl md:text-4xl mb-16">4단계로 첫 스크림까지</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* 연결선 */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              { step: '01', title: '회원가입', desc: '구글 또는 이메일로 가입하고 게임 닉네임과 티어를 등록해요.' },
              { step: '02', title: '팀 만들기', desc: '직접 팀을 만들거나 공개 팀에 가입 신청을 해요.' },
              { step: '03', title: '스크림 잡기', desc: '게시판에 공고를 올리거나 자동 매칭으로 상대를 찾아요.' },
              { step: '04', title: '결과 입력', desc: '맵별 스코어를 입력하면 전적과 승률이 자동으로 기록돼요.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#13131f] border border-white/10 flex items-center justify-center mb-4 relative z-10">
                  <span className="text-[#00D2BE] font-black text-lg">{s.step}</span>
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 자동 매칭 하이라이트 ── */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">자동 매칭</p>
            <h2 className="text-white font-black text-3xl mb-5 leading-tight">상대 찾는 데<br />시간 낭비 없이</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              매칭 시작 버튼을 누르면 비슷한 티어의 팀을 자동으로 탐색해요.
              상대가 찾아지는 순간 알림이 오고 매치가 바로 생성돼요.
              기다리는 동안 다른 준비를 할 수 있어요.
            </p>
            <ul className="flex flex-col gap-2">
              {['티어 차이 ±2단계 이내 자동 탐색', 'BO1 / BO3 / BO5 포맷 선택', 'KR / AS 서버 선택', '매칭 완료 시 실시간 알림'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-400 text-xs">
                  <span className="w-1 h-1 rounded-full bg-[#00D2BE] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#13131f] border border-white/5 rounded p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-bold">자동 매칭</span>
              <span className="text-[10px] text-slate-500">비슷한 티어 자동 탐색</span>
            </div>
            <div className="flex gap-2">
              {['BO1', 'BO3', 'BO5'].map((f, i) => (
                <div key={f} className={`flex-1 py-1.5 rounded text-center text-[10px] font-bold ${i === 1 ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-500'}`}>{f}</div>
              ))}
            </div>
            <div className="flex gap-2">
              {['KR', 'AS'].map((s, i) => (
                <div key={s} className={`flex-1 py-1.5 rounded text-center text-[10px] font-bold ${i === 0 ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-500'}`}>{s}</div>
              ))}
            </div>
            <div className="bg-[#0d1a19] border border-[#00D2BE]/20 rounded px-4 py-3 flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] animate-pulse shrink-0" />
              <div>
                <p className="text-white text-xs font-bold">매칭 중...</p>
                <p className="text-slate-500 text-[10px]">23초 대기 중 · BO3 · KR</p>
              </div>
            </div>
            <div className="bg-[#00D2BE]/10 border border-[#00D2BE]/30 rounded px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[#00D2BE] text-xs font-black">매칭 완료!</p>
                <p className="text-slate-400 text-[10px]">EDITH과의 매치가 잡혔어요</p>
              </div>
              <span className="bg-[#00D2BE] text-white text-[10px] font-bold px-2.5 py-1 rounded">매치 보기 →</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-3">FAQ</p>
          <h2 className="text-center text-white font-black text-3xl mb-12">자주 묻는 질문</h2>

          <div className="flex flex-col gap-3">
            {[
              { q: '무료인가요?', a: '네, 완전 무료예요. 가입부터 스크림 매칭, 팀 관리까지 모든 기능이 무료예요.' },
              { q: '어떤 게임을 지원하나요?', a: '현재 VALORANT와 League of Legends를 지원해요. 추후 다른 게임도 추가될 예정이에요.' },
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
          </div>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="relative z-10 px-6 py-32 border-t border-white/5 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00D2BE]/5 rounded-full blur-[100px]" />
        </div>
        <p className="text-[#00D2BE] text-xs font-bold tracking-[0.3em] uppercase mb-4">지금 시작하세요</p>
        <h2 className="text-white font-black text-4xl md:text-5xl mb-5">
          다음 스크림 상대,<br />여기서 찾으세요
        </h2>
        <p className="text-slate-400 text-sm mb-10">무료 · 가입 1분 · 바로 시작</p>
        <a href={loggedIn ? '/dashboard' : '/login'}
          className="inline-block bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold px-10 py-4 rounded transition text-sm">
          {loggedIn ? '대시보드로 →' : '무료로 시작하기 →'}
        </a>
      </section>

      {/* Discord 배너 */}
      <DiscordBanner />

    </div>
  )
}
