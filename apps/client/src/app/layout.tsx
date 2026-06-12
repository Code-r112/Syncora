import { PostHogProvider } from "@/components/PostHogProvider";
import TQProvider from "@/components/TQProvider";
import { Toaster } from "@/components/ui/sonner";
import { IS_DEMO_MODE } from "@/lib/demo";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syncora",
  description:
    "Sync music with your long-distance friends in real-time. Syncora is a synchronized music player for remote listening parties. Host a session today!",
  keywords: ["music", "sync", "audio", "listening party", "real-time", "long-distance"],
  authors: [{ name: "Pranav Kokate" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Syncora",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          inter.variable,
          "antialiased font-sans selection:bg-primary-800 selection:text-white"
        )}
      >
        <PostHogProvider>
          <TQProvider>
            {children}
            <Toaster />
            {!IS_DEMO_MODE && <Analytics />}
          </TQProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
