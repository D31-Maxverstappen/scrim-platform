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
              <li>전략 노트 — 맵별 전략·상대 분석을 우리 팀끼리만 기록·공유</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#00D2BE]/25 bg-[#00D2BE]/[0.04] p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00D2BE]" />
              <h2 className="text-white font-bold text-lg">라이엇(Riot) 데이터 투명성</h2>
            </div>
            <p className="text-slate-500 text-xs mb-5">D31.GG가 Riot Games 데이터를 어떻게, 왜 사용하는지 투명하게 공개합니다.</p>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-slate-200 font-semibold mb-2">어떤 데이터를 사용하나요</h3>
                <ul className="flex flex-col gap-2.5 text-slate-400">
                  <li className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#00D2BE] border border-[#00D2BE]/40 rounded px-1.5 py-0.5">사용 중</span>
                      <span className="text-slate-200">계정 확인 (Riot Account API)</span>
                    </span>
                    <span className="text-slate-500 pl-1">사용자가 직접 입력한 라이엇 ID(이름#태그)로 본인 확인을 거쳐 PUUID·게임명·태그라인을 받아옵니다. PUUID는 계정을 안정적으로 연결하기 위한 식별자로만 쓰입니다.</span>
                  </li>
                  <li className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 border border-slate-600 rounded px-1.5 py-0.5">승인 후 예정</span>
                      <span className="text-slate-200">발로란트 티어 (VAL Ranked API)</span>
                    </span>
                    <span className="text-slate-500 pl-1">현재 티어는 사용자가 직접 입력한 값을 사용합니다. Production 키 승인 후, 라이엇 발로란트 랭크 API로 본인의 경쟁전 티어를 자동 조회해 프로필 표시·실력 기반 매칭에 활용할 예정입니다.</span>
                  </li>
                  <li className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 border border-slate-600 rounded px-1.5 py-0.5">승인 후 예정</span>
                      <span className="text-slate-200">발로란트 전적·통계 (VAL Match API)</span>
                    </span>
                    <span className="text-slate-500 pl-1">Production 키 승인 후, 사용자 본인의 최근 매치 기록·요원·K/D 등 전적을 표시할 예정입니다. 현재 전적 화면은 &lsquo;미리보기&rsquo; 표기와 함께 예시(목업) 데이터로 동작합니다.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-slate-200 font-semibold mb-2">어떻게·왜 사용하나요</h3>
                <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
                  <li>실력(티어) 기반으로 비슷한 수준의 스크림·내전 상대를 매칭하기 위해</li>
                  <li>사용자 본인의 전적·랭크를 프로필에서 보기 좋게 보여주기 위해</li>
                  <li>라이엇 데이터는 위 목적으로만 사용하며, 제3자에게 판매·제공하지 않습니다</li>
                </ul>
              </div>

              <div>
                <h3 className="text-slate-200 font-semibold mb-2">저장과 보존</h3>
                <p className="text-slate-400">연동 시 PUUID·게임명·태그라인·티어를 사용자 계정에 연결해 저장합니다. 사용자가 연동을 해제하거나 계정을 탈퇴하면 해당 데이터는 삭제됩니다. 자세한 내용은 <Link href="/privacy" className="text-[#00D2BE] hover:underline">개인정보처리방침</Link>을 참고해주세요.</p>
              </div>

              <div>
                <h3 className="text-slate-200 font-semibold mb-2">준수</h3>
                <p className="text-slate-500 text-xs leading-relaxed">D31.GG는 Riot Games API 약관 및 개발자 정책을 준수합니다. D31.GG는 Riot Games, Inc.가 보증·후원·제휴한 서비스가 아니며, Riot Games 및 관련 자산의 모든 상표·저작권은 Riot Games, Inc.에 귀속됩니다.</p>
              </div>
            </div>
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
