import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BlindModeProvider } from "@/context/BlindModeContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { MouseReactiveGrid } from "@/components/MouseReactiveGrid";
import { FloatingSpheres } from "@/components/FloatingSpheres";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeX-Ray | Intelligence Tier",
  description: "Elite Career-Tech platform designed for merit-based hiring and AI deep semantic insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <body className="flex flex-col bg-slate-950 text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
        <BlindModeProvider>
          <SmoothScrollProvider>
            {/* Interactive global backgrounds — beneath all content */}
            <FloatingSpheres />
            <MouseReactiveGrid />
            {/* Ambient purple radial glow top-right */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed top-0 right-0 w-[700px] h-[700px] rounded-full z-0"
              style={{
                background: "radial-gradient(circle at 70% 20%, rgba(139,92,246,0.07) 0%, transparent 65%)",
              }}
            />
            {/* Ambient cyan radial glow bottom-left */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full z-0"
              style={{
                background: "radial-gradient(circle at 30% 80%, rgba(6,182,212,0.05) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 flex flex-col min-h-full">
              <Navigation />
              {children}
            </div>
          </SmoothScrollProvider>
        </BlindModeProvider>
      </body>
    </html>
  );
}
