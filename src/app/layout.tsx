import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

// next/font が build 時にフォントを取得して self-host し、Vercel CDN から
// 配信する。CSS 内 @import の外部リクエストが消えるため、初回画面の
// First Paint が 100〜400ms 改善する。
const mPlusRounded1c = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ["Hiragino Maru Gothic Pro", "Meiryo", "system-ui", "sans-serif"],
  variable: "--font-mplus-rounded",
});

export const metadata: Metadata = {
  title: "SAKURA OS",
  description: "さくら株式会社 業務管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={mPlusRounded1c.variable}>
      <body className="min-h-screen bg-bg text-ink antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
