export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <a href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</a>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">개인정보 처리방침</h1>
        <p className="text-slate-500 text-sm mb-12">최종 수정일: 2026년 6월 18일</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. 수집하는 개인정보</h2>
            <p className="text-slate-400 mb-3">D31(이하 "서비스")은 다음과 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>이메일 주소 (회원가입 시)</li>
              <li>라이엇 게임즈 계정명 및 태그 (선택, 게임 계정 연동 시)</li>
              <li>게임 티어 정보 (선택, 직접 입력)</li>
              <li>프로필 사진 (선택, 직접 업로드)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. 개인정보 수집 목적</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>회원 식별 및 서비스 제공</li>
              <li>스크림 매칭 및 팀 관리 기능 제공</li>
              <li>매너 점수 시스템 운영</li>
              <li>서비스 개선 및 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. 개인정보 보유 및 이용 기간</h2>
            <p className="text-slate-400">회원 탈퇴 시까지 보유합니다. 탈퇴 요청 시 관련 법령에 따라 일정 기간 보관 후 즉시 파기합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. 개인정보 제3자 제공</h2>
            <p className="text-slate-400">서비스는 원칙적으로 수집한 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의거하거나 수사기관의 요청이 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. 개인정보 처리 위탁</h2>
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
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. 이용자의 권리</h2>
            <p className="text-slate-400">이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며 처리 정지를 요청할 수 있습니다. 요청은 아래 이메일로 문의해주세요.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. 개인정보 보호책임자</h2>
            <div className="bg-white/5 rounded p-4 text-slate-400 text-xs flex flex-col gap-1">
              <p>서비스명: D31</p>
              <p>이메일: ceoofd31@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. 개정 이력</h2>
            <p className="text-slate-400">본 방침은 2026년 6월 18일에 최초 제정되었습니다. 내용 변경 시 서비스 내 공지를 통해 안내합니다.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
