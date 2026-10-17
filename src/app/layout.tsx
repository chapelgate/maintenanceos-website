import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { PreLaunchBanner } from "@/components/PreLaunchBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WebsiteMeasurement } from "@/components/WebsiteMeasurement";
import { SkipLink } from "@/components/SkipLink";
import { marketingJsonLd } from "@/lib/json-ld";
import { buildRootMetadata } from "@/lib/page-meta";
import { contentSecurityPolicy } from "@/lib/static-security-headers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={contentSecurityPolicy()}
        />
      </head>
      <body
        className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <JsonLd data={marketingJsonLd()} />
        <WebsiteMeasurement />
        <SkipLink />
        <PreLaunchBanner />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
