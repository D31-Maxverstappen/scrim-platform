import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext'
import 'flag-icons/css/flag-icons.min.css'

export const metadata: Metadata = {
  title: "D31 - 스크림 매칭 플랫폼",
  description: "실력에 맞는 팀을 찾고, 스크림을 잡고, 매너 점수로 신뢰를 쌓으세요. 대한민국 최초 발로란트 & 리그 오브 레전드 스크림 매칭 플랫폼.",
  openGraph: {
    title: "D31 - 스크림 매칭 플랫폼",
    description: "실력에 맞는 팀을 찾고, 스크림을 잡고, 매너 점수로 신뢰를 쌓으세요.",
    siteName: "D31",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/logo.png", width: 569, height: 439, alt: "D31 로고" }],
  },
  twitter: {
    card: "summary",
    title: "D31 - 스크림 매칭 플랫폼",
    description: "대한민국 최초 발로란트 & LoL 스크림 매칭 플랫폼",
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
      <body>
        <LanguageProvider>
        {children}
        </LanguageProvider>
        <footer className="border-t border-white/5 bg-[#07070b] py-6 mt-auto">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© 2026 D31. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="/terms" className="hover:text-slate-400 transition">이용약관</a>
              <a href="/privacy" className="hover:text-slate-400 transition">개인정보 처리방침</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
