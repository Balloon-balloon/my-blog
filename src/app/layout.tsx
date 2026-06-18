import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import AnimeBackground from "@/components/AnimeBackground";
import ClickEffects from "@/components/ClickEffects";
import MouseTrail from "@/components/MouseTrail";
import VisitorCounter from "@/components/VisitorCounter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "个人博客",
  description: "一个充满二次元气息的个人博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* 动漫人物背景 */}
          <AnimeBackground />
          
          {/* 点击特效 */}
          <ClickEffects />

          {/* 鼠标轨迹 */}
          <MouseTrail />

          {/* 访客计数器 */}
          <VisitorCounter />

          {/* 导航栏 */}
          <Navbar />
          
          {/* 主内容 */}
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
