import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BlindModeProvider } from "@/context/BlindModeContext";
import { AuthProvider } from "@/context/AuthContext";
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
      <body className="flex flex-col bg-background text-foreground selection:bg-primary-green/30 overflow-x-hidden">
        <BlindModeProvider>
          <AuthProvider>
            <SmoothScrollProvider>
              <div className="relative flex flex-col min-h-screen">
                <Navigation />
                
                {/* 1. LAYER: Backgrounds (-z-20) */}
                {/* 2. LAYER: Spheres (-z-10) */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                  <FloatingSpheres />
                </div>
                
                {/* 3. LAYER: Reactive Grid (z-5) */}
                <MouseReactiveGrid />

                {/* 4. LAYER: Page Content (z-10+) */}
                <div className="relative flex-grow z-10">
                  {children}
                </div>
              </div>
            </SmoothScrollProvider>
          </AuthProvider>
        </BlindModeProvider>
      </body>
    </html>
  );
}
