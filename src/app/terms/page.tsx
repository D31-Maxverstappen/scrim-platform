import Link from 'next/link'
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</Link>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">이용약관</h1>
        <p className="text-slate-500 text-sm mb-12">최종 수정일: 2026년 6월 18일</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제1조 (목적)</h2>
            <p className="text-slate-400">본 약관은 D31(이하 "서비스")이 제공하는 스크림 매칭 플랫폼 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>"서비스"란 D31이 운영하는 스크림 매칭 플랫폼을 의미합니다.</li>
              <li>"이용자"란 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
              <li>"스크림"이란 게임 팀 간의 연습 경기를 의미합니다.</li>
              <li>"매너 점수"란 경기 후 상대팀이 평가하는 게임 매너 지표를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제3조 (서비스 이용)</h2>
            <p className="text-slate-400 mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>허위 정보 입력 (티어, 게임 계정 등)</li>
              <li>스크림 신청 후 무단 불참 (노쇼)</li>
              <li>타인의 계정 도용 또는 사칭</li>
              <li>욕설, 비방, 혐오 표현 사용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>음란물 또는 부적절한 콘텐츠 업로드</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제4조 (매너 점수 시스템)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>매너 점수는 경기 후 상대팀의 평가를 바탕으로 산정됩니다.</li>
              <li>노쇼, 욕설, 비매너 행위는 매너 점수에 영향을 줄 수 있습니다.</li>
              <li>매너 점수가 일정 기준 이하로 떨어지면 서비스 이용이 제한될 수 있습니다.</li>
              <li>허위 신고 또는 조작 시 제재를 받을 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제5조 (서비스 중단)</h2>
            <p className="text-slate-400">서비스는 점검, 장애, 기타 운영상의 이유로 일시적으로 중단될 수 있습니다. 사전 공지가 가능한 경우 공지하며, 긴급한 경우 사후 공지할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제6조 (면책조항)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>서비스는 이용자 간의 스크림 매칭을 중개할 뿐, 경기 결과나 분쟁에 대한 책임을 지지 않습니다.</li>
              <li>이용자가 입력한 허위 정보로 인해 발생한 문제에 대해 서비스는 책임지지 않습니다.</li>
              <li>천재지변, 서버 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제7조 (약관 변경)</h2>
            <p className="text-slate-400">서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 효력이 발생합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제8조 (문의)</h2>
            <div className="bg-white/5 rounded p-4 text-slate-400 text-xs flex flex-col gap-1">
              <p>서비스명: D31</p>
              <p>이메일: ceoofd31@gmail.com</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
