import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // PDF生成 API ルート(Node ランタイム)で public/stamps と public/fonts の
  // バイナリファイルを読み込むため、Vercel の serverless function bundle に
  // 明示的に含める。
  outputFileTracingIncludes: {
    "/api/estimates/[id]/pdf": [
      "./public/stamps/**/*",
      "./public/fonts/**/*",
    ],
    "/api/invoices/[id]/pdf": [
      "./public/stamps/**/*",
      "./public/fonts/**/*",
    ],
  },
};

export default nextConfig;
