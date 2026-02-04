import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画像最適化の設定
  images: {
    // ローカル画像のみを許可（外部URLは使用しない）
    unoptimized: false,
  },

  // 実験的機能
  experimental: {
    // Server Actionsのボディサイズ制限を増加（画像アップロード用）
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },

  // セキュリティヘッダー
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ],
};

export default nextConfig;
