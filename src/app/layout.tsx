import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스크림 플랫폼",
  description: "발로란트 & 리그 오브 레전드 스크림 매칭 플랫폼",
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
        {children}
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
