"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/onboarding-ingest/packages/website/scan/index.ts
var index_exports = {};
__export(index_exports, {
  main: () => main,
  proxyPersistentScan: () => proxyPersistentScan
});
module.exports = __toCommonJS(index_exports);

// packages/onboarding-ingest/src/ssrf.ts
var BLOCKED_HOSTNAMES = /* @__PURE__ */ new Set([
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
  "kubernetes.default.svc.cluster.local"
]);
var BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".corp",
  ".private"
];
function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
}
function isBlockedMetadataHost(hostname) {
  const h = normalizeHostname(hostname);
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h === "metadata.google.internal") return true;
  if (h.startsWith("metadata.")) return true;
  return false;
}
function parseIPv4Literal(hostname) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!m) return null;
  const parts = [m[1], m[2], m[3], m[4]];
  const octets = [];
  for (const part of parts) {
    if (part.length > 1 && part.startsWith("0")) return null;
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    octets.push(n);
  }
  return octets;
}
function isPrivateOrReservedIPv4(a, b, _c = 0, _d = 0) {
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}
function isPrivateOrReservedIPv6(hostname) {
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
      hi >> 8 & 255,
      hi & 255,
      lo >> 8 & 255,
      lo & 255
    );
  }
  if (/^fe[89ab]/i.test(h)) return true;
  if (/^f[cd]/i.test(h)) return true;
  if (/^ff/i.test(h)) return true;
  return false;
}
function isProbablyPublicHostname(hostname) {
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
function allowPublicHttpsUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol === "http:") {
    url = new URL(`https://${url.host}${url.pathname}${url.search}${url.hash}`);
  }
  if (url.protocol !== "https:") {
    return { ok: false, reason: "unsupported_scheme" };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "userinfo_not_allowed" };
  }
  if (!isProbablyPublicHostname(url.hostname)) {
    return { ok: false, reason: "non_public_host" };
  }
  return { ok: true, url };
}

// packages/onboarding-ingest/packages/website/scan/index.ts
var MAX_SCAN_URL_LENGTH = 2048;
var RATE_WINDOW_MS = 6e4;
var RATE_MAX = 8;
var HOST_RATE_MAX = 6;
var UPSTREAM_TIMEOUT_MS = 25e3;
var DEFAULT_PERSISTENT_SCANNER_ENDPOINT = "https://178-128-171-45.sslip.io/v1/onboarding/scan";
var SCAN_PATH = "/v1/onboarding/scan";
function scannerRuntimeUrl() {
  const configured = process.env.SCANNER_V2_RUNTIME_URL?.trim() ?? "";
  try {
    const url = new URL(configured);
    if (url.protocol === "https:" || url.protocol === "http:") {
      if (url.pathname === "" || url.pathname === "/") url.pathname = SCAN_PATH;
      return url.toString();
    }
  } catch {
  }
  return DEFAULT_PERSISTENT_SCANNER_ENDPOINT;
}
var rateBuckets = /* @__PURE__ */ new Map();
function pruneRateBuckets(now) {
  const cutoff = now - RATE_WINDOW_MS;
  for (const [key, stamps] of rateBuckets) {
    const fresh = stamps.filter((stamp) => stamp > cutoff);
    if (fresh.length === 0) rateBuckets.delete(key);
    else if (fresh.length !== stamps.length) rateBuckets.set(key, fresh);
  }
}
function allowRate(key, max, now = Date.now()) {
  const cutoff = now - RATE_WINDOW_MS;
  const previous = (rateBuckets.get(key) ?? []).filter((stamp) => stamp > cutoff);
  if (previous.length >= max) {
    rateBuckets.set(key, previous);
    return false;
  }
  previous.push(now);
  rateBuckets.set(key, previous);
  return true;
}
function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
function response(statusCode, body, origin = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept"
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return { statusCode, headers, body };
}
async function proxyPersistentScan(url, fetcher = fetch, endpoint = scannerRuntimeUrl(), crawlId = "") {
  try {
    const upstream = await fetcher(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        ...crawlId ? { crawlId } : {}
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });
    if (upstream.status === 404) {
      return {
        statusCode: 404,
        body: { ok: false, error: "upstream_not_found" }
      };
    }
    const text = await upstream.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return {
        statusCode: 502,
        body: {
          ok: false,
          error: "upstream_invalid_response",
          message: "The persistent scan runtime returned an invalid response.",
          warnings: ["upstream_invalid_response"]
        }
      };
    }
    return { statusCode: upstream.status, body };
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || /timeout/i.test(error.message));
    return {
      statusCode: timedOut ? 504 : 502,
      body: {
        ok: false,
        error: timedOut ? "timeout" : "upstream_unavailable",
        message: timedOut ? "The persistent scan runtime exceeded the bounded request time." : "The persistent scan runtime is unavailable.",
        warnings: [timedOut ? "timeout" : "upstream_unavailable"]
      }
    };
  }
}
async function main(event = {}) {
  const method = event.http?.method?.toUpperCase() ?? "GET";
  const headers = event.http?.headers ?? {};
  const origin = headers.origin ?? "";
  const clientIp = (headers["x-forwarded-for"] ?? "unknown").split(",")[0]?.trim() || "unknown";
  if (method === "OPTIONS") return response(204, "", origin);
  if (method !== "POST") {
    return response(405, { ok: false, error: "method_not_allowed" }, origin);
  }
  const url = typeof event.url === "string" ? event.url.trim() : "";
  if (!url) {
    return response(
      400,
      {
        ok: false,
        error: "invalid_url",
        message: "JSON body must include a string url."
      },
      origin
    );
  }
  if (url.length > MAX_SCAN_URL_LENGTH) {
    return response(
      400,
      {
        ok: false,
        error: "url_too_long",
        message: "The website address is too long to scan."
      },
      origin
    );
  }
  const allowed = allowPublicHttpsUrl(url);
  const now = Date.now();
  pruneRateBuckets(now);
  if (!allowRate(`ip:${clientIp}`, RATE_MAX, now)) {
    return response(
      429,
      {
        ok: false,
        error: "rate_limited",
        message: "Too many scan requests. Try again shortly."
      },
      origin
    );
  }
  const host = hostnameOf(url);
  if (host && !allowRate(`host:${clientIp}|${host}`, HOST_RATE_MAX, now)) {
    return response(
      429,
      {
        ok: false,
        error: "rate_limited",
        message: "Too many scan requests for this website. Try again shortly."
      },
      origin
    );
  }
  if (!allowed.ok) {
    return response(
      400,
      {
        ok: false,
        error: allowed.reason,
        message: "Only public HTTPS business websites can be scanned.",
        warnings: [allowed.reason]
      },
      origin
    );
  }
  const crawlId = typeof event.crawlId === "string" ? event.crawlId.trim() : "";
  const result = await proxyPersistentScan(allowed.url.toString(), fetch, void 0, crawlId);
  return response(result.statusCode, result.body, origin);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main,
  proxyPersistentScan
});
