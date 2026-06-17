'use client'

const games = [
  {
    name: 'VALORANT',
    sub: '발로란트',
    color: '#ff4655',
    glow: 'rgba(255,70,85,0.4)',
    bg: 'linear-gradient(135deg, #1a0508 0%, #0d0206 100%)',
    desc: '5v5 Tactical FPS',
    href: '/login?game=valorant',
    logo: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        {/* V 심볼 — 발로란트 느낌의 커스텀 아이콘 */}
        <polygon points="8,20 40,68 72,20 58,20 40,48 22,20" fill="#ff4655"/>
        <polygon points="22,20 40,48 58,20 50,20 40,36 30,20" fill="#ff4655" opacity="0.4"/>
        <rect x="36" y="8" width="8" height="14" rx="2" fill="#ff4655" opacity="0.6"/>
      </svg>
    ),
  },
  {
    name: 'LEAGUE OF LEGENDS',
    sub: '리그 오브 레전드',
    color: '#c89b3c',
    glow: 'rgba(200,155,60,0.4)',
    bg: 'linear-gradient(135deg, #0d0e16 0%, #070810 100%)',
    desc: '5v5 Strategy MOBA',
    href: '/login?game=lol',
    logo: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        {/* 방패 + 검 심볼 */}
        <path d="M40 6 L68 18 L68 44 C68 58 55 68 40 74 C25 68 12 58 12 44 L12 18 Z" stroke="#c89b3c" strokeWidth="2.5" fill="#c89b3c11"/>
        <path d="M40 6 L68 18 L68 44 C68 58 55 68 40 74" stroke="#c89b3c" strokeWidth="2.5" fill="none"/>
        <line x1="40" y1="22" x2="40" y2="58" stroke="#c89b3c" strokeWidth="3" strokeLinecap="round"/>
        <line x1="28" y1="36" x2="52" y2="36" stroke="#c89b3c" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="40" cy="36" r="4" fill="#c89b3c"/>
      </svg>
    ),
  },
]

export default function HomePage() {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/8 rounded-full blur-[120px]" />
      </div>

      {/* 네비바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070b]/80 backdrop-blur border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <span className="text-white font-black text-xl tracking-widest bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          D31
        </span>
        <a href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
          시작하기
        </a>
      </nav>

      {/* 히어로 */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-48 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <p className="text-green-400 text-xs font-semibold tracking-[0.3em] uppercase">Korea's First Scrim Platform</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
          스크림 · 내전<br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">매칭 플랫폼</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mb-12 leading-relaxed">
          실력에 맞는 팀을 찾고, 스크림을 잡고,<br />매너 점수로 신뢰를 쌓으세요.
        </p>
        <div className="flex gap-3">
          <a href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl transition text-sm">
            무료로 시작하기
          </a>
          <a href="/scrims" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm">
            스크림 둘러보기
          </a>
        </div>
      </section>

      {/* 게임 선택 */}
      <section className="relative z-10 px-6 pb-32 max-w-4xl mx-auto w-full">
        <p className="text-center text-slate-600 text-xs font-semibold tracking-[0.3em] uppercase mb-8">지원 게임</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {games.map((game) => (
            <a
              key={game.name}
              href={game.href}
              style={{ background: game.bg }}
              className="group relative flex items-center gap-6 rounded-2xl p-7 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              {/* 글로우 */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 50%, ${game.glow} 0%, transparent 70%)` }}
              />

              <div className="relative z-10 shrink-0">{game.logo}</div>

              <div className="relative z-10">
                <p className="text-white font-black text-lg tracking-wide">{game.name}</p>
                <p className="text-slate-500 text-xs mb-3">{game.desc}</p>
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

      {/* 통계 바 */}
      <section className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { label: '등록 팀', value: '—' },
            { label: '진행된 스크림', value: '—' },
            { label: '평균 매너점수', value: '100' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-black text-3xl mb-1">{s.value}</p>
              <p className="text-slate-600 text-xs uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
