import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
