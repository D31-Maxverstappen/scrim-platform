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
        {loggedIn && (
          <a href="/dashboard" className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-sm font-bold px-5 py-2.5 rounded transition">
            홈으로
          </a>
        )}
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

      {/* Discord 배너 */}
      <DiscordBanner />

    </div>
  )
}
