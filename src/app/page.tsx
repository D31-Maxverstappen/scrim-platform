'use client'

const games = [
  {
    name: '발로란트',
    color: '#ff4655',
    glow: 'rgba(255,70,85,0.5)',
    border: '#ff4655',
    bg: '#1a0a0b',
    emoji: '🎯',
    desc: '5v5 전술 FPS',
    href: '/scrims?game=valorant',
  },
  {
    name: '리그 오브 레전드',
    color: '#c89b3c',
    glow: 'rgba(200,155,60,0.5)',
    border: '#c89b3c',
    bg: '#0a0e1a',
    emoji: '⚔️',
    desc: '5v5 전략 MOBA',
    href: '/scrims?game=lol',
  },
  {
    name: '오버워치',
    color: '#f99e1a',
    glow: 'rgba(249,158,26,0.5)',
    border: '#f99e1a',
    bg: '#1a1000',
    emoji: '🦸',
    desc: '6v6 팀 FPS',
    href: '/scrims?game=overwatch',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col">

      {/* 네비바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f13]/80 backdrop-blur border-b border-white/10 px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-white font-bold text-xl tracking-widest hover:text-indigo-400 transition">
          D31
        </a>
        <a
          href="/login"
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          로그인 / 시작하기
        </a>
      </nav>

      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-20">
        <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-4">Korea&apos;s First Scrim Platform</p>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          최초의 스크림 · 내전<br />구인구직 플랫폼
          <span className="text-indigo-400"> D31</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10">
          프로 준비생부터 일반인까지 — 발로란트, 리그 오브 레전드, 오버워치 스크림을 지금 바로 찾아보세요.
        </p>
        <a
          href="/login"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
        >
          지금 시작하기 →
        </a>
      </section>

      {/* 게임 선택 섹션 */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-white font-bold text-2xl mb-10">게임을 선택하세요</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <a
              key={game.name}
              href={game.href}
              style={{
                background: game.bg,
                borderColor: 'transparent',
              }}
              className="group relative flex flex-col items-center justify-center rounded-2xl p-10 border-2 cursor-pointer transition-all duration-300 hover:scale-105"
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = game.border
                el.style.boxShadow = `0 0 30px ${game.glow}`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'transparent'
                el.style.boxShadow = 'none'
              }}
            >
              <div className="text-7xl mb-4">{game.emoji}</div>
              <h3 className="text-white font-bold text-xl mb-2">{game.name}</h3>
              <p className="text-slate-400 text-sm">{game.desc}</p>
              <span
                className="mt-4 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: game.color + '33', color: game.color }}
              >
                스크림 찾기 →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-white/10 text-center text-slate-600 text-sm py-6">
        © 2026 D31. All rights reserved.
      </footer>
    </div>
  )
}
