import type { Metadata } from "next";
import { defaultLocale } from "@/i18n/config";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "WorkSmartOS",
  description: "Redirecting...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale}>
      <head>
        <meta httpEquiv="refresh" content={`0;url=/${defaultLocale}/`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteConfig.siteUrl || "https://worksmartos.co.uk"}/${defaultLocale}/`} />
      </head>
      <body>{children}</body>
    </html>
  );
}