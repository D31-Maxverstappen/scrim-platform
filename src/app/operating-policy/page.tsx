import Link from 'next/link'

export default function OperatingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition">← 메인으로</Link>

        <h1 className="text-white font-black text-3xl mt-6 mb-2">운영정책</h1>
        <p className="text-slate-500 text-sm mb-12">최종 수정일: 2026년 6월 26일</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제1조 (목적)</h2>
            <p className="text-slate-400">본 운영정책은 D31(이하 &quot;서비스&quot;)이 건전하고 공정한 스크림·내전 환경을 유지하기 위해 이용자가 준수해야 할 사항과 위반 시 제재 기준을 규정함을 목적으로 합니다. 본 정책은 이용약관의 일부를 구성합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제2조 (매너 점수 운영)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>경기 종료 후 상대 팀은 매너 점수를 평가할 수 있습니다.</li>
              <li>매너 점수는 매칭 우선순위 및 신뢰도 지표로 활용됩니다.</li>
              <li>고의적인 평점 조작·담합이 확인될 경우 제재 대상이 됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제3조 (노쇼 및 불참)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>스크림 확정 후 정당한 사유 없이 불참(노쇼)하는 행위를 금지합니다.</li>
              <li>불가피한 사정으로 참여가 어려운 경우 상대 팀에 사전 통보해야 합니다.</li>
              <li>반복적인 노쇼는 매칭 제한 등 제재 대상이 됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제4조 (금지 행위)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>허위 정보 등록(티어·게임 계정 등) 및 타인 사칭</li>
              <li>욕설·비방·차별·혐오 표현 등 타인에 대한 모욕 행위</li>
              <li>대리 게임, 어뷰징 등 공정성을 해치는 행위</li>
              <li>광고·도배·스팸 및 서비스의 정상적 운영을 방해하는 행위</li>
              <li>음란물 등 부적절한 콘텐츠 게시</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제5조 (신고 및 처리 절차)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>이용자는 위반 행위 발견 시 신고 기능을 통해 신고할 수 있습니다.</li>
              <li>접수된 신고는 운영팀의 검토를 거쳐 처리되며, 필요 시 소명을 요청할 수 있습니다.</li>
              <li>허위·악의적 신고 또한 제재 대상이 될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제6조 (제재 기준)</h2>
            <p className="text-slate-400 mb-2">위반의 경중과 반복 정도에 따라 다음 단계의 제재가 적용될 수 있습니다.</p>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>1단계 — 경고</li>
              <li>2단계 — 일정 기간 매칭·이용 제한(일시정지)</li>
              <li>3단계 — 영구 이용 정지</li>
            </ul>
            <p className="text-slate-400 mt-2">사안이 중대한 경우(대리 게임, 심각한 모욕 등) 단계와 무관하게 즉시 영구 정지될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제7조 (이의신청)</h2>
            <p className="text-slate-400">제재를 받은 이용자는 통지를 받은 날로부터 일정 기간 내에 <Link href="/support" className="text-[#00D2BE] hover:underline">문의하기</Link>를 통해 이의를 신청할 수 있으며, 운영팀은 재검토 후 결과를 안내합니다.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">제8조 (정책 변경 및 면책)</h2>
            <ul className="list-disc list-inside text-slate-400 flex flex-col gap-1.5">
              <li>본 정책은 서비스 운영상 필요에 따라 변경될 수 있으며, 변경 시 공지합니다.</li>
              <li>이용자 간 분쟁 및 그로 인해 발생한 손해에 대해 서비스는 책임을 지지 않습니다.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
