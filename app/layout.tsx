import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LancerWallet",
  description: "Open-source crypto wallet inspired by TrustWallet",
};

import Navigation from "./components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main 
          className="min-h-screen"
          style={{
            marginLeft: typeof window !== 'undefined' && window.location.pathname !== '/' ? '240px' : '0',
            paddingBottom: '80px',
            padding: 'var(--space-6)',
            background: 'var(--bg-primary)'
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
