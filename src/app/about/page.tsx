import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</Link>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">소개</h1>
        <p className="text-slate-500 text-sm mb-12">D31.GG — 대한민국 최초 발로란트 스크림 매칭 플랫폼</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">D31.GG는</h2>
            <p className="text-slate-400">D31.GG는 발로란트 팀들이 실력에 맞는 상대를 빠르게 찾아 스크림(연습 경기)과 내전을 잡을 수 있도록 돕는 매칭 플랫폼입니다. 여기저기 흩어져 있던 스크림 구인을 한곳에 모아, 더 이상 디스코드 서버를 전전하지 않아도 되게 만듭니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">이런 문제를 풉니다</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>스크림 상대를 구하느라 여러 디스코드 서버를 전전하는 번거로움</li>
              <li>티어·실력이 맞지 않는 상대와의 매칭으로 인한 시간 낭비</li>
              <li>노쇼·매너 문제로 인한 스크림 경험 저하</li>
              <li>흩어진 경기 기록을 일일이 정리해야 하는 불편함</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">핵심 기능</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>자동 매칭 — 비슷한 티어의 팀을 자동으로 탐색·연결</li>
              <li>스크림 게시판 &amp; 캘린더 — 날짜별 공고를 한눈에</li>
              <li>내전 — 팀·커뮤니티 내전 운영</li>
              <li>전적 &amp; 랭킹/통계 — 경기 결과 자동 집계와 팀 리더보드</li>
              <li>매너 점수 — 경기 후 평가로 신뢰 기반 매칭</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">우리의 방향</h2>
            <p className="text-slate-400">D31.GG는 아마추어부터 준프로까지, 모든 발로란트 팀이 더 자주, 더 좋은 상대와 연습할 수 있는 환경을 만드는 것을 목표로 합니다. 발로란트를 시작으로 점차 다른 종목으로도 확장해 나갈 계획입니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">문의</h2>
            <p className="text-slate-400">제휴·제안·문의는 <Link href="/support" className="text-[#00D2BE] hover:underline">문의하기</Link>를 통해 보내주세요.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
