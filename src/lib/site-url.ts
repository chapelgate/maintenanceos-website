import { siteConfig } from "@/config/site";

/**
 * Origin used when NEXT_PUBLIC_SITE_URL is empty at build time.
 * The site serves at https://worksmartos.co.uk.
 */
export const FALLBACK_SITE_URL =
  "https://worksmartos.co.uk";

/**
 * Host Andrew asked for, now serving this export.
 * Canonical, Open Graph, sitemap, and JSON-LD resolve to this origin.
 */
export const INTENDED_PRODUCTION_SITE_URL =
  "https://worksmartos.co.uk";

/** Canonical origin without a trailing slash. */
export function getCanonicalSiteUrl(): string {
  const raw = siteConfig.siteUrl.trim();
  const origin = raw !== "" ? raw : FALLBACK_SITE_URL;
  return origin.replace(/\/$/, "");
}

/** Absolute URL for a site path. Marketing paths use trailing slashes. */
export function absoluteUrl(path = "/"): string {
  const origin = getCanonicalSiteUrl();
  if (path === "" || path === "/") {
    return `${origin}/`;
  }
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  const slashed = prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
  return `${origin}${slashed}`;
}
