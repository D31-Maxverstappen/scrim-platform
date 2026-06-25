import type { Metadata } from "next";
import localFont from "next/font/local";
import SidebarGate from "@/components/layout/SidebarGate";
import Footer from "@/components/layout/Footer";
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
            // 라이트 모드 일시 비활성화 — 다크 모드 고정 (추후 라이트 모드 재개 시 아래로 복구)
            // var t = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
          })();
        `}} />
      </head>
      <body className={pretendard.variable}>
        <SidebarGate />
        {children}
        <Footer />
      </body>
    </html>
  );
}
