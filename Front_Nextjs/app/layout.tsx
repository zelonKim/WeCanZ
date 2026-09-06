import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import GlobalSocketListener from "@/components/GlobalSocketListener";
import SocketInitializer from "@/components/SocketInitializer.tsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "종태원 Jongtaewon",
  description: "오늘 밤, 가장 핫한 술번개 & 클럽번개",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-[#121212]">
      <body
        className={` ${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] min-h-screen`}
      >
        <Providers>
          <SocketInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
