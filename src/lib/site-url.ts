import { siteConfig } from "@/config/site";

/**
 * Origin used when NEXT_PUBLIC_SITE_URL is empty at build time.
 * DigitalOcean staging is the current public host for this static export.
 */
export const FALLBACK_SITE_URL =
  "https://seahorse-app-4oasq.ondigitalocean.app";

/**
 * Host Andrew asked for, once DNS for this name serves this export.
 * getCanonicalSiteUrl() does not read this constant. Canonical, Open Graph,
 * sitemap, and JSON-LD stay on NEXT_PUBLIC_SITE_URL, or FALLBACK_SITE_URL
 * when that variable is empty. Do not set NEXT_PUBLIC_SITE_URL to this
 * value until the name resolves.
 */
export const INTENDED_PRODUCTION_SITE_URL =
  "https://maintenanceos.chapelgatetechnologies.com";

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
