import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "D31 - 발로란트 스크림 매칭 플랫폼",
  description: "실력에 맞는 팀을 찾고, 스크림을 잡고, 매너 점수로 신뢰를 쌓으세요. 대한민국 최초 발로란트 스크림 매칭 플랫폼.",
  openGraph: {
    title: "D31 - 발로란트 스크림 매칭 플랫폼",
    description: "실력에 맞는 팀을 찾고, 스크림을 잡고, 매너 점수로 신뢰를 쌓으세요.",
    siteName: "D31",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/logo.png", width: 569, height: 439, alt: "D31 로고" }],
  },
  twitter: {
    card: "summary",
    title: "D31 - 발로란트 스크림 매칭 플랫폼",
    description: "대한민국 최초 발로란트 스크림 매칭 플랫폼",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          })();
        `}} />
      </head>
      <body className={pretendard.variable}>
        {children}
        <footer className="border-t border-white/[0.08] bg-[#07070b] py-7 mt-auto">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-white font-black text-xl tracking-tight">D31<span className="text-[#00D2BE]">.GG</span></span>
                <p className="text-slate-600 text-xs mt-1">대한민국 발로란트 스크림 매칭 플랫폼</p>
              </div>
              <div className="flex gap-5 text-xs text-slate-500">
                <a href="/support" className="hover:text-slate-300 transition">문의하기</a>
                <a href="/terms" className="hover:text-slate-300 transition">이용약관</a>
                <a href="/privacy" className="hover:text-slate-300 transition">개인정보 처리방침</a>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4 flex flex-col gap-1.5">
              <span className="text-xs text-slate-600">© 2026 D31. All rights reserved.</span>
              <p className="text-[10px] text-slate-700 leading-relaxed max-w-3xl">
                D31.GG is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Valorant. Valorant and Riot Games are trademarks or registered trademarks of Riot Games, Inc. Valorant © Riot Games, Inc.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
