import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AppContentLoading } from "@/components/layout/app-content-loading";
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
  title: "TableSpot",
  description: "Find and reserve tables at the best restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background md:flex">
          <SidebarNav />
          <main className="min-w-0 flex-1 md:min-h-screen">
            <Suspense fallback={<AppContentLoading />}>
              {children}
            </Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
