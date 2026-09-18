import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** Page-level SEO chrome for content routes. Respects root robots (pre-launch noindex). */
export function contentPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const path = opts.path.endsWith("/") ? opts.path : `${opts.path}/`;
  const canonical =
    siteConfig.siteUrl !== ""
      ? `${siteConfig.siteUrl.replace(/\/$/, "")}${path}`
      : undefined;

  return {
    title: opts.title,
    description: opts.description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: `${opts.title} · ${siteConfig.name}`,
      description: opts.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
  };
}
