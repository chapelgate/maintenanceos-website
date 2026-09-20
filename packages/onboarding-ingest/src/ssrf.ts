/**
 * SSRF guard helpers — scaffold for onboarding fetch.
 * Not production-hardened until review + tests land.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.internal.",
]);

/** Returns true if hostname looks like a public DNS name (not IP literal private ranges). */
export function isProbablyPublicHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(h)) return false;
  if (h === "0.0.0.0" || h.endsWith(".local") || h.endsWith(".internal")) {
    return false;
  }
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10 || a === 127 || a === 0) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
  }
  return h.includes(".");
}

export type FetchAllowDecision =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function allowPublicHttpsUrl(raw: string): FetchAllowDecision {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "unsupported_scheme" };
  }
  if (!isProbablyPublicHostname(url.hostname)) {
    return { ok: false, reason: "non_public_host" };
  }
  return { ok: true, url };
}
