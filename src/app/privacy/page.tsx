import Link from 'next/link'
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</Link>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">개인정보 처리방침</h1>
        <p className="text-slate-500 text-sm mb-12">시행일: 2026년 6월 27일 · 최종 수정일: 2026년 6월 27일</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <p className="text-slate-400">D31(이하 &quot;서비스&quot;)은 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. 수집하는 개인정보 항목</h2>
            <p className="text-slate-400 mb-3">서비스는 다음과 같은 개인정보를 수집합니다.</p>

            <p className="text-slate-300 font-semibold mb-1.5">가. 회원가입 및 로그인 (Discord 계정 연동)</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5 mb-3">
              <li>이메일 주소</li>
              <li>Discord 계정 식별자(Discord ID), 표시 이름, 프로필 이미지(아바타)</li>
            </ul>

            <p className="text-slate-300 font-semibold mb-1.5">나. 라이엇(Riot) 계정 연동 (선택)</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5 mb-3">
              <li>라이엇 ID(게임명 및 태그라인)</li>
              <li>PUUID(라이엇 계정 고유 식별자)</li>
              <li>발로란트 경쟁전 티어·랭크 정보</li>
              <li>발로란트 매치 기록(요원, K/D 등 전적 통계) — Production API 적용 시</li>
            </ul>

            <p className="text-slate-300 font-semibold mb-1.5">다. 이용자가 직접 입력하는 정보 (선택)</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5 mb-3">
              <li>닉네임, 티어 정보, 프로필 사진</li>
            </ul>

            <p className="text-slate-300 font-semibold mb-1.5">라. 서비스 이용 과정에서 자동으로 수집되는 정보</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>IP 주소, 쿠키, 세션 정보, 접속 일시 및 이용 기록</li>
              <li>기기 정보, 브라우저 종류 및 버전</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. 개인정보의 수집·이용 목적</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>회원 식별 및 본인 확인, 서비스 제공</li>
              <li>스크림·내전 매칭 및 팀 관리 기능 제공</li>
              <li>실력(티어) 기반 매칭 및 전적·랭킹 표시</li>
              <li>매너 점수 시스템 운영 및 부정 이용 방지</li>
              <li>서비스 개선, 통계 분석 및 문의 응대</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-slate-400 mb-2">원칙적으로 회원 탈퇴 시까지 보유하며, 탈퇴 시 지체 없이 파기합니다. 다만 관계 법령에 따라 다음과 같이 일정 기간 보존할 수 있습니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (동법)</li>
              <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (동법)</li>
              <li>서비스 접속 로그 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. 만 14세 미만 아동의 개인정보</h2>
            <p className="text-slate-400">서비스는 원칙적으로 만 14세 미만 아동의 회원가입을 받지 않습니다. 만 14세 미만 아동의 개인정보가 수집된 사실이 확인될 경우, 해당 정보는 지체 없이 파기합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. 개인정보의 파기 절차 및 방법</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>파기 절차: 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 내부 방침에 따라 지체 없이 파기합니다.</li>
              <li>파기 방법: 전자적 파일은 복구·재생이 불가능한 방법으로 영구 삭제하며, 출력물 등은 분쇄 또는 소각합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. 개인정보의 제3자 제공</h2>
            <p className="text-slate-400">서비스는 원칙적으로 수집한 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의거하거나 수사기관의 적법한 요청이 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. 개인정보 처리의 위탁</h2>
            <p className="text-slate-400 mb-2">서비스는 원활한 운영을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
            <div className="bg-white/5 rounded p-4">
              <table className="w-full text-xs text-slate-400">
                <thead>
                  <tr className="text-slate-300 border-b border-white/10">
                    <th className="text-left pb-2">수탁업체</th>
                    <th className="text-left pb-2">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr><td className="py-2">Supabase Inc.</td><td className="py-2">데이터베이스 및 인증 서비스</td></tr>
                  <tr><td className="py-2">Vercel Inc.</td><td className="py-2">서비스 호스팅</td></tr>
                  <tr><td className="py-2">Discord Inc.</td><td className="py-2">소셜 로그인(OAuth) 인증</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. 개인정보의 국외 이전</h2>
            <p className="text-slate-400 mb-2">서비스는 위 수탁업체의 해외 인프라를 이용함에 따라 개인정보가 국외로 이전·보관됩니다.</p>
            <div className="bg-white/5 rounded p-4">
              <table className="w-full text-xs text-slate-400">
                <thead>
                  <tr className="text-slate-300 border-b border-white/10">
                    <th className="text-left pb-2">이전받는 자</th>
                    <th className="text-left pb-2">국가</th>
                    <th className="text-left pb-2">이전 항목</th>
                    <th className="text-left pb-2">보유 기간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr><td className="py-2">Supabase Inc.</td><td className="py-2">미국</td><td className="py-2">제1항 수집 항목 전체</td><td className="py-2">회원 탈퇴 시까지</td></tr>
                  <tr><td className="py-2">Vercel Inc.</td><td className="py-2">미국</td><td className="py-2">접속 로그·기기 정보</td><td className="py-2">위탁 계약 종료 시까지</td></tr>
                  <tr><td className="py-2">Discord Inc.</td><td className="py-2">미국</td><td className="py-2">로그인 인증 정보</td><td className="py-2">연동 해제 시까지</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs mt-2">이전 시점·방법: 서비스 이용 시점에 정보통신망을 통해 전송됩니다. 이용자는 개인정보 국외 이전을 거부할 수 있으나, 이 경우 서비스 이용이 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. 라이엇 게임즈(Riot Games) 데이터의 처리</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>서비스는 이용자가 직접 입력한 라이엇 ID로 본인 확인을 거쳐 PUUID·게임명·태그라인을 수신하며, PUUID는 계정을 안정적으로 연결하기 위한 식별자로만 사용합니다.</li>
              <li>Production API 적용 시 발로란트 티어·매치 기록을 자동 조회하여 매칭 및 전적 표시에 활용합니다.</li>
              <li>라이엇 데이터는 위 목적으로만 사용하며, 제3자에게 판매·제공하지 않습니다.</li>
              <li>이용자가 라이엇 연동을 해제하거나 회원을 탈퇴하면 관련 라이엇 데이터(PUUID 포함)는 지체 없이 삭제됩니다.</li>
            </ul>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">D31.GG는 Riot Games API 약관 및 개발자 정책을 준수합니다. D31.GG는 Riot Games, Inc.가 보증·후원·제휴한 서비스가 아니며, Riot Games 및 관련 자산의 모든 상표·저작권은 Riot Games, Inc.에 귀속됩니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. 쿠키의 운영</h2>
            <p className="text-slate-400">서비스는 로그인 세션 유지 등을 위해 쿠키를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 등 일부 서비스 이용에 제한이 있을 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">11. 이용자 및 법정대리인의 권리와 행사 방법</h2>
            <p className="text-slate-400">이용자는 언제든지 자신의 개인정보를 조회·수정·삭제할 수 있으며, 처리 정지 및 동의 철회를 요청할 수 있습니다. 요청은 아래 개인정보 보호책임자의 이메일로 문의해주시면 지체 없이 조치합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">12. 개인정보 보호책임자</h2>
            <div className="bg-white/5 rounded p-4 text-slate-400 text-xs flex flex-col gap-1">
              <p>서비스명: D31</p>
              <p>직책: 개인정보 보호책임자</p>
              <p>이메일: ceoofd31@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">13. 권익침해 구제 방법</h2>
            <p className="text-slate-400 mb-2">개인정보 침해에 관한 상담·신고가 필요한 경우 아래 기관에 문의할 수 있습니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>개인정보침해신고센터 (국번 없이 118 / privacy.kisa.or.kr)</li>
              <li>개인정보 분쟁조정위원회 (1833-6972 / kopico.go.kr)</li>
              <li>대검찰청 사이버수사과 (1301) / 경찰청 사이버수사국 (182)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">14. 개정 이력</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>2026년 6월 18일: 최초 제정</li>
              <li>2026년 6월 27일: 수집 항목(Discord·PUUID·매치·자동수집) 명확화, 국외 이전·아동·파기·구제 절차 추가</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
