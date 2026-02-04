import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Insight Tutor - マルチモーダル参考書学習アシスタント",
  description:
    "参考書のページを画像でアップロードすると、AIがわかりやすく解説します。テキストと音声の両方で学習できます。",
  keywords: ["学習", "AI", "参考書", "教科書", "音声読み上げ", "Gemini"],
  authors: [{ name: "Insight Tutor" }],
  openGraph: {
    title: "Insight Tutor - マルチモーダル参考書学習アシスタント",
    description: "AIが参考書の内容をわかりやすく解説",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}