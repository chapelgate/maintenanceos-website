import type { Metadata } from "next";
import localFont from "next/font/local";
import { PreLaunchBanner } from "@/components/PreLaunchBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WebsiteMeasurement } from "@/components/WebsiteMeasurement";
import { SkipLink } from "@/components/SkipLink";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { buildRootMetadata } from "@/lib/page-meta";
import { contentSecurityPolicy } from "@/lib/static-security-headers";
import { siteConfig } from "@/config/site";
import { locales, defaultLocale, type Locale, isValidLocale } from "@/i18n/config";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../../../public/fonts/Inter-Regular.woff2", weight: "400" },
    { path: "../../../public/fonts/Inter-Medium.woff2", weight: "600" },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: rawLocale } = await params;
  const validLocale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;

  const metadata = buildRootMetadata();

  const alternates: Metadata["alternates"] = {
    languages: Object.fromEntries(
      locales.map((loc) => [loc, `/${loc}/`])
    ),
  };

  const hreflangLinks = locales.map((loc) => ({
    rel: "alternate",
    hrefLang: loc,
    href: `${siteConfig.siteUrl || "https://worksmartos.co.uk"}/${loc}/`,
  }));

  return (
    <html lang={validLocale}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy()} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="alternate" hrefLang="x-default" href={`${siteConfig.siteUrl || "https://worksmartos.co.uk"}/${defaultLocale}/`} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel={link.rel} hrefLang={link.hrefLang} href={link.href} />
        ))}
      </head>
      <body className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <LocaleProvider initialLocale={validLocale}>
          <WebsiteMeasurement />
          <SkipLink />
          <PreLaunchBanner />
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}