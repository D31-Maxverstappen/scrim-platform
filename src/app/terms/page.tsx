import Link from 'next/link'
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</Link>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">이용약관</h1>
        <p className="text-slate-500 text-sm mb-12">시행일: 2026년 6월 27일 · 최종 수정일: 2026년 6월 27일</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제1조 (목적)</h2>
            <p className="text-slate-400">본 약관은 D31(이하 &quot;서비스&quot;)이 제공하는 스크림 매칭 플랫폼 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>&quot;서비스&quot;란 D31이 운영하는 스크림 매칭 플랫폼을 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
              <li>&quot;스크림&quot;이란 게임 팀 간의 연습 경기를 의미합니다.</li>
              <li>&quot;매너 점수&quot;란 경기 후 상대팀이 평가하는 게임 매너 지표를 의미합니다.</li>
              <li>&quot;게시물&quot;이란 이용자가 서비스에 게재한 글, 채팅, 평가, 프로필 정보 등 일체의 콘텐츠를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제3조 (약관의 게시 및 개정)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>본 약관은 서비스 화면에 게시하여 공시합니다.</li>
              <li>서비스는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.</li>
              <li>약관을 개정하는 경우 적용일자 및 사유를 명시하여 최소 7일 전(이용자에게 불리한 변경의 경우 최소 30일 전)부터 공지합니다.</li>
              <li>이용자가 개정 약관에 동의하지 않는 경우, 적용일 이전에 이용계약을 해지(회원 탈퇴)할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제4조 (회원가입 및 계정)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>이용자는 서비스가 정한 절차(소셜 로그인 등)에 따라 회원가입을 신청하며, 서비스가 이를 승낙함으로써 이용계약이 성립합니다.</li>
              <li>이용자는 정확한 정보를 제공해야 하며, 계정 관리 책임은 이용자 본인에게 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제5조 (미성년자의 이용)</h2>
            <p className="text-slate-400">서비스는 원칙적으로 만 14세 미만 아동의 회원가입을 받지 않습니다. 미성년자가 서비스를 이용하는 경우, 관련 법령에 따라 법정대리인의 동의가 필요할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제6조 (서비스 이용)</h2>
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
            <h2 className="text-white font-bold text-lg mb-3">제7조 (매너 점수 시스템)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>매너 점수는 경기 후 상대팀의 평가를 바탕으로 산정됩니다.</li>
              <li>노쇼, 욕설, 비매너 행위는 매너 점수에 영향을 줄 수 있습니다.</li>
              <li>매너 점수가 일정 기준 이하로 떨어지면 서비스 이용이 제한될 수 있습니다.</li>
              <li>허위 신고 또는 조작 시 제재를 받을 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제8조 (게시물의 권리와 관리)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>이용자가 작성한 게시물의 저작권은 해당 이용자에게 귀속되며, 그 내용에 대한 책임도 작성한 이용자에게 있습니다.</li>
              <li>이용자는 서비스가 게시물을 서비스 운영·노출·홍보 목적으로 사용할 수 있도록 이용을 허락합니다.</li>
              <li>게시물이 본 약관 또는 운영정책을 위반하거나 타인의 권리를 침해하는 경우, 서비스는 사전 통지 없이 해당 게시물을 삭제·비공개 처리할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제9조 (지식재산권)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>서비스가 제작한 콘텐츠 및 서비스에 관한 저작권 등 지식재산권은 서비스에 귀속됩니다.</li>
              <li>이용자는 서비스의 사전 동의 없이 이를 복제·배포·상업적으로 이용할 수 없습니다.</li>
              <li>발로란트 및 Riot Games 관련 자산의 모든 상표·저작권은 Riot Games, Inc.에 귀속됩니다. 본 서비스는 Riot Games, Inc.가 보증·후원·제휴한 서비스가 아닙니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제10조 (회원 탈퇴 및 이용계약 해지)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>이용자는 언제든지 서비스 내 기능 또는 문의를 통해 회원 탈퇴를 요청할 수 있으며, 서비스는 지체 없이 이를 처리합니다.</li>
              <li>이용자가 본 약관 또는 운영정책을 중대하게 위반한 경우, 서비스는 사전 통지 후(긴급한 경우 사후 통지) 이용계약을 해지할 수 있습니다.</li>
              <li>탈퇴 시 개인정보의 처리는 <Link href="/privacy" className="text-[#00D2BE] hover:underline">개인정보 처리방침</Link>에 따릅니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제11조 (서비스 중단)</h2>
            <p className="text-slate-400">서비스는 점검, 장애, 기타 운영상의 이유로 일시적으로 중단될 수 있습니다. 사전 공지가 가능한 경우 공지하며, 긴급한 경우 사후 공지할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제12조 (면책조항)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>서비스는 이용자 간의 스크림 매칭을 중개할 뿐, 경기 결과나 분쟁에 대한 책임을 지지 않습니다.</li>
              <li>이용자가 입력한 허위 정보로 인해 발생한 문제에 대해 서비스는 책임지지 않습니다.</li>
              <li>천재지변, 서버 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제13조 (준거법 및 재판관할)</h2>
            <p className="text-slate-400">본 약관은 대한민국 법령에 따라 해석되며, 서비스와 이용자 간 발생한 분쟁에 관한 소송의 관할은 민사소송법에 따른 관할 법원으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제14조 (문의)</h2>
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
