import { siteConfig } from "@/config/site";

/**
 * Origin used when NEXT_PUBLIC_SITE_URL is empty at build time.
 * DigitalOcean staging is the current public host for this static export.
 */
export const FALLBACK_SITE_URL =
  "https://seahorse-app-4oasq.ondigitalocean.app";

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
