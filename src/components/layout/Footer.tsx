'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { showSidebar } from '@/lib/showSidebar'

// 전역 푸터 — 좌측(로고·면책·카피라이트) + 우측 3열 링크(서비스·회사·정책).
// 사이드바가 있는 페이지에서만 ml-56 오프셋을 적용해 본문과 정렬을 맞춘다.
export default function Footer() {
  const pathname = usePathname()
  const offset = showSidebar(pathname) ? 'ml-56' : ''

  const linkCls = 'hover:text-slate-300 transition w-fit'
  const colTitle = 'text-slate-300 text-xs font-semibold mb-3'
  const colWrap = 'flex flex-col gap-2.5 text-xs text-slate-500'
  const soon = 'text-slate-700'

  return (
    <footer className={`border-t border-white/[0.08] bg-[#07070b] py-10 mt-auto ${offset}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">

          {/* 좌측 — 로고 + 면책 + 카피라이트 */}
          <div className="max-w-md">
            <span className="text-white font-black text-3xl tracking-tight">D31<span className="text-[#00D2BE]">.GG</span></span>
            <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
              D31.GG is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Valorant. Valorant and Riot Games are trademarks or registered trademarks of Riot Games, Inc. Valorant © Riot Games, Inc.
            </p>
            <p className="mt-3 text-[11px] text-slate-600">© 2026 D31. All rights reserved.</p>
          </div>

          {/* 우측 — 3열 클러스터(오른쪽 밀집) */}
          <div className="flex gap-10 sm:gap-14 shrink-0">

            {/* 서비스 */}
            <div>
              <p className={colTitle}>서비스</p>
              <div className={colWrap}>
                <Link href="/scrims" className={linkCls}>스크림</Link>
                <Link href="/inhouse" className={linkCls}>내전</Link>
                <span className={soon}>대회 <span className="text-[11px]">(추후)</span></span>
                <Link href="/leaderboard" className={linkCls}>랭킹/통계</Link>
              </div>
            </div>

            {/* 회사 */}
            <div>
              <p className={colTitle}>회사</p>
              <div className={colWrap}>
                <Link href="/about" className={linkCls}>소개</Link>
                <Link href="/support" className={linkCls}>문의하기</Link>
                <span className={soon}>채용 <span className="text-[11px]">(추후)</span></span>
              </div>
            </div>

            {/* 정책 */}
            <div>
              <p className={colTitle}>정책</p>
              <div className={colWrap}>
                <Link href="/terms" className={linkCls}>이용약관</Link>
                <Link href="/privacy" className={linkCls}>개인정보 처리방침</Link>
                <Link href="/operating-policy" className={linkCls}>운영정책</Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </footer>
  )
}
