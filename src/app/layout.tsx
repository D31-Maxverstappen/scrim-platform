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
      <body>{children}</body>
    </html>
  );
}
