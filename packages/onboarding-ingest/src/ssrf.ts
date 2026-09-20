/**
 * SSRF guard helpers for website onboarding fetch.
 *
 * Hostname and literal-IP checks only. Callers must still:
 * 1. Resolve DNS and re-check with `assertResolvedAddressesPublic`
 * 2. Re-check the destination after every redirect
 * 3. Cap pages, bytes, and wall time
 *
 * Fetched text is untrusted data — never a system prompt.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "kubernetes.default",
  "kubernetes.default.svc",
  "kubernetes.default.svc.cluster.local",
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".corp",
  ".private",
] as const;

export type FetchAllowDecision =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export type AddressAllowDecision = { ok: true } | { ok: false; reason: string };

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
}

export function isBlockedMetadataHost(hostname: string): boolean {
  const h = normalizeHostname(hostname);
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h === "metadata.google.internal") return true;
  if (h.startsWith("metadata.")) return true;
  return false;
}

/** Dotted-decimal IPv4 only. Rejects octal-looking leading zeros and short forms. */
export function parseIPv4Literal(
  hostname: string,
): [number, number, number, number] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!m) return null;
  const parts = [m[1], m[2], m[3], m[4]] as const;
  const octets: number[] = [];
  for (const part of parts) {
    if (part.length > 1 && part.startsWith("0")) return null;
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    octets.push(n);
  }
  return octets as [number, number, number, number];
}

export function isPrivateOrReservedIPv4(
  a: number,
  b: number,
  _c = 0,
  _d = 0,
): boolean {
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // RFC1918
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT / some cloud metadata
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast + reserved
  return false;
}

export function isPrivateOrReservedIPv6(hostname: string): boolean {
  const h = normalizeHostname(hostname);
  if (h === "::" || h === "0:0:0:0:0:0:0:0" || h === "::0") return true;
  if (h === "::1" || h === "0:0:0:0:0:0:0:1") return true;

  const mappedDotted = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(h);
  if (mappedDotted) {
    const v4 = parseIPv4Literal(mappedDotted[1]);
    if (!v4) return true;
    return isPrivateOrReservedIPv4(...v4);
  }

  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(h);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return isPrivateOrReservedIPv4(
      (hi >> 8) & 255,
      hi & 255,
      (lo >> 8) & 255,
      lo & 255,
    );
  }

  // Link-local fe80::/10, unique-local fc00::/7, multicast ff00::/8
  if (/^fe[89ab]/i.test(h)) return true;
  if (/^f[cd]/i.test(h)) return true;
  if (/^ff/i.test(h)) return true;
  return false;
}

/** Returns true if hostname looks like a public DNS name or public IP literal. */
export function isProbablyPublicHostname(hostname: string): boolean {
  const h = normalizeHostname(hostname);
  if (!h) return false;
  if (isBlockedMetadataHost(h)) return false;
  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => h.endsWith(suffix))) {
    return false;
  }

  const v4 = parseIPv4Literal(h);
  if (v4) return !isPrivateOrReservedIPv4(...v4);

  if (h.includes(":")) {
    return !isPrivateOrReservedIPv6(h);
  }

  return h.includes(".");
}

/**
 * Allow only public http(s) URLs — https required.
 * Does not resolve DNS; use `assertResolvedAddressesPublic` after lookup.
 */
export function allowPublicHttpsUrl(raw: string): FetchAllowDecision {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:") {
    return {
      ok: false,
      reason: url.protocol === "http:" ? "http_not_allowed" : "unsupported_scheme",
    };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "userinfo_not_allowed" };
  }
  if (!isProbablyPublicHostname(url.hostname)) {
    return { ok: false, reason: "non_public_host" };
  }
  return { ok: true, url };
}

/** Fail closed if any resolved address is private, loopback, link-local, or unparseable. */
export function assertResolvedAddressesPublic(
  addresses: string[],
): AddressAllowDecision {
  if (!addresses.length) return { ok: false, reason: "no_addresses" };
  for (const addr of addresses) {
    const h = normalizeHostname(addr);
    const v4 = parseIPv4Literal(h);
    if (v4) {
      if (isPrivateOrReservedIPv4(...v4)) {
        return { ok: false, reason: "non_public_resolved_ip" };
      }
      continue;
    }
    if (h.includes(":")) {
      if (isPrivateOrReservedIPv6(h)) {
        return { ok: false, reason: "non_public_resolved_ip" };
      }
      continue;
    }
    return { ok: false, reason: "unrecognised_address" };
  }
  return { ok: true };
}
