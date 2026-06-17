import Navbar from '@/components/Navbar'

const STATS = [
  { label: '등록된 팀', value: '—', sub: '팀' },
  { label: '오늘 스크림', value: '—', sub: '매치' },
  { label: '활성 유저', value: '—', sub: '명' },
  { label: '평균 매너점수', value: '—', sub: 'pt' },
]

const GAMES = [
  { name: '발로란트', color: 'from-red-500/20 to-pink-500/10', border: 'border-red-500/20', dot: 'bg-red-400', href: '/scrims?game=valorant' },
  { name: '리그 오브 레전드', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400', href: '/scrims?game=lol' },
  { name: '오버워치 2', color: 'from-orange-500/20 to-yellow-500/10', border: 'border-orange-500/20', dot: 'bg-orange-400', href: '/scrims?game=overwatch' },
]

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#07070b]">
      <Navbar />

      <div className="pt-16">

        {/* ── 히어로 배너 ── */}
        <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/60 to-transparent border-b border-white/5">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">Live Platform</span>
              </div>
              <h1 className="text-white text-3xl md:text-4xl font-black mb-2 leading-tight">
                한국 최초<br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">스크림 매칭 플랫폼</span>
              </h1>
              <p className="text-slate-400 text-sm">발로란트 · LoL · 오버워치 팀을 찾고, 스크림을 잡으세요.</p>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <a href="/teams/create" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl transition text-sm text-center">
                팀 만들기
              </a>
              <a href="/scrims" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3 rounded-xl transition text-sm text-center">
                스크림 찾기
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">

          {/* ── 통계 바 ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                <p className="text-slate-500 text-xs mb-2">{s.label}</p>
                <p className="text-white text-2xl font-black">{s.value} <span className="text-slate-500 text-sm font-normal">{s.sub}</span></p>
              </div>
            ))}
          </div>

          {/* ── 게임별 빠른 이동 ── */}
          <div className="mt-8">
            <h2 className="text-white font-bold text-lg mb-4">게임별 스크림</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GAMES.map((g) => (
                <a
                  key={g.name}
                  href={g.href}
                  className={`group relative bg-gradient-to-br ${g.color} border ${g.border} rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${g.dot}`} />
                    <span className="text-white font-bold text-sm">{g.name}</span>
                  </div>
                  <p className="text-slate-400 text-xs">스크림 보기 →</p>
                </a>
              ))}
            </div>
          </div>

          {/* ── 메인 그리드 ── */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-16">

            {/* 실시간 모집 */}
            <div className="md:col-span-2 bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <h3 className="text-white font-bold text-sm">실시간 스크림 모집</h3>
                </div>
                <a href="/scrims" className="text-indigo-400 text-xs hover:underline">전체 보기 →</a>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6l3-3 3 3v6M3 21h18" />
                  </svg>
                </div>
                <p className="text-sm mb-1">현재 모집 중인 스크림이 없어요</p>
                <a href="/scrims/post" className="mt-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-xs font-semibold px-5 py-2.5 rounded-lg transition">
                  + 스크림 올리기
                </a>
              </div>
            </div>

            {/* 사이드 */}
            <div className="flex flex-col gap-4">

              {/* 내 팀 */}
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">내 팀</h3>
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-xs">소속 팀이 없어요</p>
                  <a href="/teams/create" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg transition text-center">
                    팀 만들기
                  </a>
                </div>
              </div>

              {/* 매너 점수 */}
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">매너 점수</h3>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-black text-white">100</span>
                  <span className="text-slate-500 text-sm mb-1">/ 200</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full" style={{ width: '50%' }} />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>기본 등급</span>
                  <span>다음: 실버 120pt</span>
                </div>
              </div>

              {/* 팀 랭킹 */}
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest">팀 랭킹</h3>
                  <a href="/leaderboard" className="text-indigo-400 text-xs hover:underline">전체 →</a>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-xs font-black w-4 text-center ${i === 1 ? 'text-yellow-400' : i === 2 ? 'text-slate-300' : i === 3 ? 'text-orange-400' : 'text-slate-600'}`}>
                        {i}
                      </span>
                      <div className="flex-1 h-2.5 bg-white/5 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
