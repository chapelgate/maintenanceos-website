/**
 * SSRF-safe HTTPS GET.
 *
 * 1. allowPublicHttpsUrl (https, no userinfo, public hostname)
 * 2. DNS lookup, then assertResolvedAddressesPublic
 * 3. Connect to a resolved public IP with SNI/Host of the original hostname
 * 4. Re-run 1–3 on every redirect (no automatic follow)
 */

import dns from "node:dns/promises";
import https from "node:https";
import {
  allowPublicHttpsUrl,
  assertResolvedAddressesPublic,
  parseIPv4Literal,
} from "./ssrf.ts";
import { USER_AGENT } from "./extract.ts";
import {
  ScanError,
  type HttpGetFn,
  type LookupFn,
  type SafeHttpResponse,
} from "./types.ts";

export const DEFAULT_MAX_REDIRECTS = 4;
export const DEFAULT_PAGE_TIMEOUT_MS = 4000;
export const DEFAULT_MAX_BYTES_PER_PAGE = 256 * 1024;

export type FetchSafeOptions = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  remainingMs?: number;
};

function header(headers: Record<string, string>, name: string): string {
  const want = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === want) return value;
  }
  return "";
}

export async function defaultLookup(hostname: string): Promise<string[]> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (parseIPv4Literal(host) || host.includes(":")) {
    return [host];
  }
  const records = await dns.lookup(host, { all: true, verbatim: true });
  return [...new Set(records.map((row) => row.address))];
}

export function httpsGetToIp(
  url: URL,
  ip: string,
  opts: { timeoutMs: number; maxBytes: number },
): Promise<SafeHttpResponse> {
  return new Promise((resolve, reject) => {
    const port = url.port ? Number(url.port) : 443;
    const headers: Record<string, string | number> = {
      Host: url.host,
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.1",
      "Accept-Language": "en-GB,en;q=0.8",
      "Accept-Encoding": "identity",
      Connection: "close",
    };

    const req = https.request(
      {
        host: ip,
        port,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: url.hostname.replace(/^\[|\]$/g, ""),
        headers,
        timeout: opts.timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > opts.maxBytes) {
            req.destroy();
            reject(
              new ScanError(
                "response_too_large",
                "The page exceeded the fetch size cap.",
                422,
              ),
            );
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          const rawHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "string") rawHeaders[key] = value;
            else if (Array.isArray(value)) rawHeaders[key] = value.join(", ");
          }
          resolve({
            status: res.statusCode ?? 0,
            headers: rawHeaders,
            body: Buffer.concat(chunks).toString("utf8"),
            url,
          });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(
        new ScanError("timeout", "The page fetch timed out.", 504),
      );
    });
    req.on("error", (err) => {
      reject(
        new ScanError(
          "fetch_failed",
          err instanceof Error ? err.message : "Fetch failed.",
          422,
        ),
      );
    });
    req.end();
  });
}

export async function fetchPublicHttps(
  raw: string,
  options: FetchSafeOptions = {},
): Promise<SafeHttpResponse> {
  const lookup = options.lookup ?? defaultLookup;
  const get = options.get ?? httpsGetToIp;
  const timeoutMs = Math.max(
    250,
    Math.min(options.timeoutMs ?? DEFAULT_PAGE_TIMEOUT_MS, options.remainingMs ?? DEFAULT_PAGE_TIMEOUT_MS),
  );
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES_PER_PAGE;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  let current = raw;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const allow = allowPublicHttpsUrl(current);
    if (!allow.ok) {
      throw new ScanError(allow.reason, ssrfMessage(allow.reason), 400);
    }

    let addresses: string[];
    try {
      addresses = await lookup(allow.url.hostname);
    } catch (err) {
      if (err instanceof ScanError) throw err;
      throw new ScanError(
        "dns_failed",
        "Could not resolve this hostname.",
        422,
      );
    }

    const ipCheck = assertResolvedAddressesPublic(addresses);
    if (!ipCheck.ok) {
      throw new ScanError(ipCheck.reason, ssrfMessage(ipCheck.reason), 400);
    }

    // Prefer IPv4, but do not make one CDN/hosting edge authoritative.
    // Every resolved address has already passed the public-IP guard. If a
    // chosen edge rejects the hostname with 401/403, or the connection itself
    // fails, try the next validated address before declaring the page
    // unavailable. This preserves the original IPv4 preference while avoiding
    // false scan failures caused by edge-specific policy.
    const orderedAddresses = [
      ...addresses.filter((address) => Boolean(parseIPv4Literal(address))),
      ...addresses.filter((address) => !parseIPv4Literal(address)),
    ];

    let response: SafeHttpResponse | null = null;
    let lastError: unknown = null;
    const addressAttemptsStarted = Date.now();

    for (const address of orderedAddresses) {
      const elapsed = Date.now() - addressAttemptsStarted;
      const attemptTimeoutMs = Math.max(250, timeoutMs - elapsed);
      if (elapsed >= timeoutMs && response) break;

      try {
        const candidate = await get(allow.url, address, {
          timeoutMs: attemptTimeoutMs,
          maxBytes,
        });
        response = candidate;
        if (candidate.status !== 401 && candidate.status !== 403) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!response) {
      if (lastError instanceof ScanError) throw lastError;
      throw new ScanError(
        "fetch_failed",
        lastError instanceof Error ? lastError.message : "Fetch failed.",
        422,
      );
    }

    if (response.status >= 300 && response.status < 400) {
      const location = header(response.headers, "location");
      if (!location) {
        throw new ScanError(
          "redirect_missing_location",
          "The site returned a redirect without a Location header.",
          422,
        );
      }
      if (hop === maxRedirects) {
        throw new ScanError(
          "too_many_redirects",
          "The site redirected too many times.",
          422,
        );
      }
      let next: URL;
      try {
        next = new URL(location, allow.url);
      } catch {
        throw new ScanError("invalid_url", "Redirect Location was not a valid URL.", 400);
      }
      current = next.toString();
      continue;
    }

    return response;
  }

  throw new ScanError("too_many_redirects", "The site redirected too many times.", 422);
}

export function ssrfMessage(reason: string): string {
  switch (reason) {
    case "http_not_allowed":
      return "Only HTTPS business URLs are accepted.";
    case "unsupported_scheme":
      return "Only HTTPS business URLs are accepted.";
    case "userinfo_not_allowed":
      return "URLs with usernames or passwords are not accepted.";
    case "non_public_host":
    case "non_public_resolved_ip":
      return "This URL is not a public website and will not be fetched.";
    case "invalid_url":
      return "Enter a valid HTTPS URL.";
    default:
      return "This URL is not allowed.";
  }
}

export function isHtmlOrText(contentType: string): boolean {
  const type = contentType.toLowerCase();
  if (!type) return true;
  return (
    type.includes("text/html") ||
    type.includes("application/xhtml") ||
    type.includes("text/plain") ||
    type.includes("application/xml") ||
    type.includes("text/xml")
  );
}
