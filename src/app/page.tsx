'use client'

const games = [
  {
    name: '발로란트',
    color: '#ff4655',
    glow: 'rgba(255,70,85,0.5)',
    border: '#ff4655',
    bg: '#1a0a0b',
    desc: '5v5 전술 FPS',
    href: '/login?game=valorant',
    logo: (
      <svg viewBox="0 0 64 64" width="72" height="72" fill="none">
        <polygon points="4,52 32,12 60,52 44,52 32,32 20,52" fill="#ff4655"/>
        <polygon points="20,52 32,32 44,52" fill="#ffffff" opacity="0.15"/>
      </svg>
    ),
  },
  {
    name: '리그 오브 레전드',
    color: '#c89b3c',
    glow: 'rgba(200,155,60,0.5)',
    border: '#c89b3c',
    bg: '#0a0e1a',
    desc: '5v5 전략 MOBA',
    href: '/login?game=lol',
    logo: (
      <svg viewBox="0 0 64 64" width="72" height="72" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#c89b3c" strokeWidth="4" fill="#0a0e1a"/>
        <circle cx="32" cy="32" r="18" stroke="#c89b3c" strokeWidth="2" fill="none"/>
        <path d="M32 10 L32 54 M10 32 L54 32" stroke="#c89b3c" strokeWidth="2" opacity="0.4"/>
        <circle cx="32" cy="32" r="6" fill="#c89b3c"/>
      </svg>
    ),
  },
  {
    name: '오버워치 2',
    color: '#f99e1a',
    glow: 'rgba(249,158,26,0.5)',
    border: '#f99e1a',
    bg: '#1a1000',
    desc: '6v6 팀 FPS',
    href: '/login?game=overwatch',
    logo: (
      <svg viewBox="0 0 64 64" width="72" height="72" fill="none">
        <circle cx="32" cy="32" r="26" stroke="#f99e1a" strokeWidth="4" fill="none"/>
        <circle cx="32" cy="32" r="10" fill="#f99e1a"/>
        <path d="M32 6 C18 6 8 18 8 32" stroke="#f99e1a" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 58 C46 58 56 46 56 32" stroke="#f99e1a" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">

      {/* ── 경기장 배경 ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* 실제 e스포츠 경기장 사진 */}
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=60"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* 어두운 오버레이 - 텍스트 가독성 확보 */}
        <div className="absolute inset-0 bg-[#0a0a0f]/80" />
        {/* 상하 페이드 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f]/90" />
        {/* 중앙 스포트라이트 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* ── 네비바 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/10 px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-white font-bold text-xl tracking-widest hover:text-indigo-400 transition">
          D31
        </a>
        <a href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          로그인 / 시작하기
        </a>
      </nav>

      {/* ── 히어로 섹션 ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-44 pb-20">
        <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-5">
          Korea&apos;s First Scrim Platform
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-2xl">
          최초의 스크림 · 내전<br />구인구직 플랫폼
          <span className="text-indigo-400"> D31</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed">
          프로 준비생부터 일반인까지 —<br />
          발로란트, 리그 오브 레전드, 오버워치 스크림을 지금 바로 찾아보세요.
        </p>
        <p className="text-slate-500 text-sm">↓ 아래에서 게임을 선택해 시작하세요</p>
      </section>

      {/* ── 게임 선택 섹션 ── */}
      <section className="relative z-10 px-6 pb-28 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-slate-400 text-sm font-semibold tracking-widest uppercase mb-10">
          게임을 선택하세요
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <a
              key={game.name}
              href={game.href}
              style={{ background: game.bg, borderColor: 'transparent' }}
              className="relative flex flex-col items-center justify-center rounded-2xl p-10 border-2 cursor-pointer transition-all duration-300 hover:scale-105"
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = game.border
                el.style.boxShadow = `0 0 40px ${game.glow}, inset 0 0 40px ${game.glow.replace('0.5', '0.05')}`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'transparent'
                el.style.boxShadow = 'none'
              }}
            >
              <div className="mb-5">{game.logo}</div>
              <h3 className="text-white font-bold text-xl mb-2">{game.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{game.desc}</p>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: game.color + '22', color: game.color }}
              >
                스크림 찾기 →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="relative z-10 border-t border-white/10 text-center text-slate-600 text-sm py-6">
        © 2026 D31. All rights reserved.
      </footer>
    </div>
  )
}
