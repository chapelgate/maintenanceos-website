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
import { isIP } from "node:net";
import { gunzipSync } from "node:zlib";
import {
  allowPublicHttpsUrl,
  assertResolvedAddressesPublic,
  parseIPv4Literal,
  sameRegistrableSite,
} from "./ssrf.ts";
import { USER_AGENT } from "./extract.ts";
import {
  ScanError,
  type BinaryHttpGetFn,
  type HttpGetFn,
  type LookupFn,
  type SafeBinaryHttpResponse,
  type SafeHttpResponse,
} from "./types.ts";

export const DEFAULT_MAX_REDIRECTS = 4;
export const DEFAULT_PAGE_TIMEOUT_MS = 4000;
export const DEFAULT_MAX_BYTES_PER_PAGE = 256 * 1024;
export const PUBLIC_PAGE_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.1";
export const PUBLIC_PAGE_ACCEPT_LANGUAGE = "en-GB,en;q=0.8";

const CREDENTIAL_HEADERS = new Set([
  "authorization",
  "cookie",
  "proxy-authorization",
  "host",
  "connection",
]);

/** Browser-like page headers. Caller values override Accept, never credentials. */
export function publicPageHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: PUBLIC_PAGE_ACCEPT,
    "Accept-Language": PUBLIC_PAGE_ACCEPT_LANGUAGE,
  };
  if (!extra) return headers;
  for (const [key, value] of Object.entries(extra)) {
    if (CREDENTIAL_HEADERS.has(key.toLowerCase())) continue;
    if (!value) continue;
    headers[key] = value;
  }
  return headers;
}

export type FetchSafeOptions = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  remainingMs?: number;
  headers?: Record<string, string>;
  /** Opt-in gzip response support. Default false preserves Scanner V1. */
  acceptCompressed?: boolean;
  /** Hard ceiling after decompression when acceptCompressed is true. */
  maxDecompressedBytes?: number;
  /** Aborts an in-flight fetch even when the socket is still receiving bytes. */
  signal?: AbortSignal;
};

function header(headers: Record<string, string>, name: string): string {
  const want = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === want) return value;
  }
  return "";
}

export function decodeResponseBodyForText(input: {
  body: Buffer;
  url: URL;
  headers: Record<string, string>;
  acceptCompressed?: boolean;
  maxDecompressedBytes: number;
}): Buffer {
  if (!input.acceptCompressed) return input.body;

  const encoding = header(input.headers, "content-encoding").toLowerCase();
  const contentType = header(input.headers, "content-type").toLowerCase();
  const gzipFile =
    /(?:application\/gzip|application\/x-gzip)/i.test(contentType) ||
    /\.gz$/i.test(input.url.pathname);

  if (encoding && encoding !== "identity" && encoding !== "gzip") {
    throw new ScanError(
      "unsupported_content_encoding",
      "The response used an unsupported content encoding.",
      422,
    );
  }

  let payload = input.body;
  if (encoding === "gzip" || gzipFile) {
    try {
      payload = gunzipSync(payload, {
        maxOutputLength: input.maxDecompressedBytes,
      });
    } catch (error) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String((error as { code?: unknown }).code ?? "")
          : "";
      const message =
        error instanceof Error ? error.message : String(error);
      const tooLarge =
        code === "ERR_BUFFER_TOO_LARGE" ||
        /max(?:imum)? output|larger than|too large/i.test(message);
      throw new ScanError(
        tooLarge ? "response_too_large" : "content_decode_failed",
        tooLarge
          ? "The decompressed response exceeded the allowed size."
          : "The compressed response could not be decoded as gzip.",
        422,
      );
    }
  }

  if (payload.length > input.maxDecompressedBytes) {
    throw new ScanError(
      "response_too_large",
      "The decompressed response exceeded the allowed size.",
      422,
    );
  }

  return payload;
}

export async function defaultLookup(hostname: string): Promise<string[]> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (parseIPv4Literal(host) || host.includes(":")) {
    return [host];
  }
  const records = await dns.lookup(host, { all: true, verbatim: true });
  return [...new Set(records.map((row) => row.address))];
}

function armFetchDeadline(
  req: { destroy: () => void },
  timeoutMs: number,
  signal: AbortSignal | undefined,
  fail: (error: ScanError) => void,
): { disarm: () => void; deadlineHit: () => boolean; abortNow: () => void } {
  let hit = false;
  const fire = () => {
    if (hit) return;
    hit = true;
    req.destroy();
    fail(new ScanError("timeout", "The page fetch timed out.", 504));
  };
  const timer = setTimeout(fire, timeoutMs);
  signal?.addEventListener("abort", fire, { once: true });
  return {
    deadlineHit: () => hit,
    abortNow: () => fire(),
    disarm: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", fire);
    },
  };
}

export function httpsGetToIp(
  url: URL,
  ip: string,
  opts: {
    timeoutMs: number;
    maxBytes: number;
    headers?: Record<string, string>;
    acceptCompressed?: boolean;
    maxDecompressedBytes?: number;
    signal?: AbortSignal;
  },
): Promise<SafeHttpResponse> {
  return new Promise((resolve, reject) => {
    const port = url.port ? Number(url.port) : 443;
    const headers: Record<string, string | number> = {
      ...publicPageHeaders(opts.headers),
      "Accept-Encoding": opts.acceptCompressed ? "gzip, identity" : "identity",
      Host: url.host,
      Connection: "close",
    };

    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const family = isIP(ip);
    if (family !== 4 && family !== 6) {
      reject(new ScanError("fetch_failed", "Resolved target was not an IP address.", 422));
      return;
    }

    let settled = false;
    let deadline: ReturnType<typeof armFetchDeadline> | undefined;
    const finish = (error?: ScanError, response?: SafeHttpResponse) => {
      if (settled) return;
      settled = true;
      deadline?.disarm();
      if (error) reject(error);
      else if (response) resolve(response);
    };

    const req = https.request(
      {
        // Keep the original hostname as the HTTP/TLS authority, but pin Node's
        // DNS lookup to the public address that was already validated above.
        // This preserves SSRF rebinding protection without routing the request
        // through a raw-IP virtual host.
        hostname,
        port,
        family,
        autoSelectFamily: false,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: hostname,
        headers,
        lookup: (_hostname, options, callback) => {
          if (typeof options === "object" && options !== null && options.all) {
            callback(null, [{ address: ip, family }]);
            return;
          }
          callback(null, ip, family);
        },
        timeout: opts.timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > opts.maxBytes) {
            req.destroy();
            finish(
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
          let payload: Buffer;
          try {
            payload = decodeResponseBodyForText({
              body: Buffer.concat(chunks),
              url,
              headers: rawHeaders,
              acceptCompressed: opts.acceptCompressed,
              maxDecompressedBytes:
                opts.maxDecompressedBytes ?? opts.maxBytes,
            });
          } catch (error) {
            finish(
              error instanceof ScanError
                ? error
                : new ScanError("content_decode_failed", "The response could not be decoded.", 422),
            );
            return;
          }

          finish(undefined, {
            status: res.statusCode ?? 0,
            headers: rawHeaders,
            body: payload.toString("utf8"),
            url,
          });
        });
      },
    );

    deadline = armFetchDeadline(req, opts.timeoutMs, opts.signal, (error) => finish(error));
    if (opts.signal?.aborted) deadline.abortNow();
    req.on("timeout", () => {
      req.destroy();
      finish(new ScanError("timeout", "The page fetch timed out.", 504));
    });
    req.on("error", (err) => {
      if (deadline?.deadlineHit()) {
        finish(new ScanError("timeout", "The page fetch timed out.", 504));
        return;
      }
      finish(
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

export function httpsGetBytesToIp(
  url: URL,
  ip: string,
  opts: {
    timeoutMs: number;
    maxBytes: number;
    headers?: Record<string, string>;
  },
): Promise<SafeBinaryHttpResponse> {
  return new Promise((resolve, reject) => {
    const port = url.port ? Number(url.port) : 443;
    const headers: Record<string, string | number> = {
      ...publicPageHeaders(opts.headers),
      Accept:
        opts.headers?.Accept && opts.headers.Accept !== PUBLIC_PAGE_ACCEPT
          ? opts.headers.Accept
          : "application/pdf,text/plain,text/csv,application/csv;q=0.9,*/*;q=0.1",
      "Accept-Encoding": "identity",
      Host: url.host,
      Connection: "close",
    };

    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const family = isIP(ip);
    if (family !== 4 && family !== 6) {
      reject(
        new ScanError(
          "fetch_failed",
          "Resolved target was not an IP address.",
          422,
        ),
      );
      return;
    }

    const req = https.request(
      {
        hostname,
        port,
        family,
        autoSelectFamily: false,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: hostname,
        headers,
        lookup: (_hostname, options, callback) => {
          if (typeof options === "object" && options !== null && options.all) {
            callback(null, [{ address: ip, family }]);
            return;
          }
          callback(null, ip, family);
        },
        timeout: opts.timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let settled = false;
        res.on("data", (chunk: Buffer) => {
          if (settled) return;
          size += chunk.length;
          if (size > opts.maxBytes) {
            settled = true;
            req.destroy();
            reject(
              new ScanError(
                "response_too_large",
                "The document exceeded the fetch size cap.",
                422,
              ),
            );
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          if (settled) return;
          settled = true;
          const rawHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "string") rawHeaders[key] = value;
            else if (Array.isArray(value)) rawHeaders[key] = value.join(", ");
          }
          const payload = Buffer.concat(chunks);
          resolve({
            status: res.statusCode ?? 0,
            headers: rawHeaders,
            body: new Uint8Array(
              payload.buffer,
              payload.byteOffset,
              payload.byteLength,
            ),
            url,
          });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new ScanError("timeout", "The document fetch timed out.", 504));
    });
    req.on("error", (err) => {
      reject(
        new ScanError(
          "fetch_failed",
          err instanceof Error ? err.message : "Document fetch failed.",
          422,
        ),
      );
    });
    req.end();
  });
}

export type FetchSafeBytesOptions = {
  lookup?: LookupFn;
  get?: BinaryHttpGetFn;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  remainingMs?: number;
  headers?: Record<string, string>;
  /** Optional same-origin boundary enforced before following a redirect. */
  allowedOrigin?: string;
};

export async function fetchPublicHttpsBytes(
  raw: string,
  options: FetchSafeBytesOptions = {},
): Promise<SafeBinaryHttpResponse> {
  const lookup = options.lookup ?? defaultLookup;
  const get = options.get ?? httpsGetBytesToIp;
  const timeoutMs = Math.max(
    250,
    Math.min(
      options.timeoutMs ?? DEFAULT_PAGE_TIMEOUT_MS,
      options.remainingMs ?? DEFAULT_PAGE_TIMEOUT_MS,
    ),
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

    const ipv4Addresses = addresses.filter((address) =>
      Boolean(parseIPv4Literal(address)),
    );
    const ipv6Addresses = addresses.filter(
      (address) => !parseIPv4Literal(address),
    );
    const orderedAddresses = ipv4Addresses.length
      ? ipv4Addresses
      : ipv6Addresses;

    let response: SafeBinaryHttpResponse | null = null;
    let lastError: unknown = null;
    const addressAttemptsStarted = Date.now();

    for (const address of orderedAddresses) {
      const elapsed = Date.now() - addressAttemptsStarted;
      if (elapsed >= timeoutMs) break;
      const attemptTimeoutMs = Math.max(250, timeoutMs - elapsed);

      try {
        const candidate = await get(allow.url, address, {
          timeoutMs: attemptTimeoutMs,
          maxBytes,
          headers: publicPageHeaders(options.headers),
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

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.status !== 304
    ) {
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
        throw new ScanError(
          "invalid_url",
          "Redirect Location was not a valid URL.",
          400,
        );
      }
      if (options.allowedOrigin && !redirectStaysOnSite(next, options.allowedOrigin)) {
        throw new ScanError(
          "cross_origin_redirect",
          "The document redirected outside the submitted website.",
          422,
        );
      }
      current = next.toString();
      continue;
    }

    return response;
  }

  throw new ScanError(
    "too_many_redirects",
    "The site redirected too many times.",
    422,
  );
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
    if (options.signal?.aborted) {
      throw new ScanError("timeout", "The page fetch timed out.", 504);
    }
    const allow = allowPublicHttpsUrl(current);
    if (!allow.ok) {
      throw new ScanError(allow.reason, ssrfMessage(allow.reason), 400);
    }

    let addresses: string[];
    try {
      addresses = await lookup(allow.url.hostname);
    } catch (err) {
      if (options.signal?.aborted) {
        throw new ScanError("timeout", "The page fetch timed out.", 504);
      }
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
    const ipv4Addresses = addresses.filter((address) =>
      Boolean(parseIPv4Literal(address)),
    );
    const ipv6Addresses = addresses.filter(
      (address) => !parseIPv4Literal(address),
    );

    // Stay within one address family for a fetch attempt. A valid HTTP 401/403
    // from an IPv4 edge is an application response, not a reason to switch to
    // IPv6. Some serverless Node/TLS runtimes throw while constructing pinned
    // IPv6 sockets, which can escape the normal typed scanner response.
    // If public IPv4 exists, exhaust those addresses only; IPv6 remains the
    // fallback for genuinely IPv6-only public hosts.
    const orderedAddresses = ipv4Addresses.length
      ? ipv4Addresses
      : ipv6Addresses;

    let response: SafeHttpResponse | null = null;
    let lastError: unknown = null;
    const addressAttemptsStarted = Date.now();

    for (const address of orderedAddresses) {
      const elapsed = Date.now() - addressAttemptsStarted;
      const attemptTimeoutMs = Math.max(250, timeoutMs - elapsed);
      if (elapsed >= timeoutMs) break;

      try {
        const candidate = await get(allow.url, address, {
          timeoutMs: attemptTimeoutMs,
          maxBytes,
          headers: publicPageHeaders(options.headers),
          acceptCompressed: options.acceptCompressed,
          maxDecompressedBytes: options.maxDecompressedBytes,
          signal: options.signal,
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

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.status !== 304
    ) {
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
      if (options.allowedOrigin && !redirectStaysOnSite(next, options.allowedOrigin)) {
        throw new ScanError(
          "cross_origin_redirect",
          "The page redirected outside the submitted website.",
          422,
        );
      }
      current = next.toString();
      continue;
    }

    return response;
  }

  throw new ScanError("too_many_redirects", "The site redirected too many times.", 422);
}

function redirectStaysOnSite(next: URL, allowedOrigin: string): boolean {
  try {
    return sameRegistrableSite(next, new URL(allowedOrigin));
  } catch {
    return false;
  }
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
