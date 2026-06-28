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
  metadataBase: new URL("https://d31.gg"),
  title: "D31 - 발로란트 스크림 매칭 플랫폼",
  description: "실력에 맞는 팀을 찾고, 스크림을 잡고, 함께 성장하세요. 한국 FPS 유저들을 위한 스크림 허브.",
  openGraph: {
    title: "D31 - 발로란트 스크림 매칭 플랫폼",
    description: "실력에 맞는 팀을 찾고, 스크림을 잡고, 함께 성장하세요.",
    siteName: "D31",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/logo.png", width: 569, height: 439, alt: "D31 로고" }],
  },
  twitter: {
    card: "summary",
    title: "D31 - 발로란트 스크림 매칭 플랫폼",
    description: "한국 FPS 유저들을 위한 스크림 허브",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 다크모드 고정: data-theme를 정적 지정해 서버=클라이언트 HTML 일치 → 하이드레이션 경고 원천 제거.
  // 라이트모드 재개 시: <head>에 localStorage 읽는 인라인 스크립트 + <html>에 suppressHydrationWarning 추가.
  return (
    <html lang="ko" data-theme="dark">
      <body className={pretendard.variable}>
        <SidebarGate />
        {children}
        <Footer />
      </body>
    </html>
  );
}
