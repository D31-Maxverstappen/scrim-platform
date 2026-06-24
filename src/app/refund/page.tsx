import Link from 'next/link'
export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</Link>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">환불정책</h1>
        <p className="text-slate-500 text-sm mb-12">최종 수정일: 2026년 6월 21일</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제1조 (무료 서비스)</h2>
            <p className="text-slate-400">
              D31(이하 "서비스")은 스크림 매칭, 팀 관리, 자동 매칭 등 모든 핵심 기능을 완전 무료로 제공합니다.
              현재 서비스 내에서 결제가 발생하는 유료 항목이 존재하지 않으므로, 별도의 환불 절차가 필요하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제2조 (향후 유료 서비스 도입 시)</h2>
            <p className="text-slate-400 mb-3">
              추후 유료 기능(프리미엄 플랜, 광고 제거, 부가 기능 등)이 도입될 경우, 아래 기준에 따라 환불 정책을 운영합니다.
            </p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-2">
              <li>결제일로부터 7일 이내, 서비스를 이용하지 않은 경우 전액 환불</li>
              <li>서비스 이용 기록이 존재하는 경우, 이용 기간에 비례하여 일할 계산 후 잔여 금액 환불</li>
              <li>기술적 결함으로 서비스를 이용할 수 없었던 경우, 해당 기간에 대해 전액 환불 또는 이용 기간 연장</li>
              <li>단순 변심에 의한 환불은 결제일로부터 7일 이내에만 가능</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제3조 (환불 신청 방법)</h2>
            <p className="text-slate-400 mb-3">유료 서비스 도입 후 환불 요청은 아래 이메일로 문의해 주세요.</p>
            <div className="bg-white/5 rounded p-4 text-slate-400 text-xs flex flex-col gap-1">
              <p>서비스명: D31</p>
              <p>이메일: ceoofd31@gmail.com</p>
              <p>처리 기간: 영업일 기준 3~5일 이내</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제4조 (환불 불가 항목)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>이용자 본인의 규정 위반(욕설, 비매너, 허위 정보 입력 등)으로 인한 서비스 이용 제한</li>
              <li>이용자가 스스로 삭제한 계정 및 데이터</li>
              <li>천재지변, 불가항력에 의한 서비스 중단</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제5조 (정책 변경)</h2>
            <p className="text-slate-400">
              유료 서비스 도입 또는 정책 변경 시, 서비스 내 공지 및 이메일을 통해 사전 안내합니다.
              변경된 정책은 공지일로부터 7일 후 적용됩니다.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
