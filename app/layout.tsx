import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho, Orbit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Chatbot from "@/components/Chatbot";
import {
  ENABLE_CHATBOT,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/config";

// 本文用: モダンな読みやすさ重視
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// 見出し用: 和モダンな印象を演出
const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

// 装飾用: 数字・ラベル等のアクセント
const orbit = Orbit({
  variable: "--font-orbit",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${shipporiMincho.variable} ${orbit.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-base text-ink">
        {/* Lenis による滑らかなスクロール */}
        <SmoothScroll />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* 全ページ共通のフローティングチャットボット (config で ON/OFF) */}
        {ENABLE_CHATBOT && <Chatbot />}
      </body>
    </html>
  );
}
