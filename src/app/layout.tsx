import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PreLaunchBanner } from "@/components/PreLaunchBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Property maintenance operations`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: siteConfig.publicLaunch
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <SkipLink />
        <PreLaunchBanner />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
