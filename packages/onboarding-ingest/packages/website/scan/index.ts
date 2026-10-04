import { allowPublicHttpsUrl } from "../../../src/ssrf.ts";

type WebEvent = {
  http?: {
    headers?: Record<string, string>;
    method?: string;
    path?: string;
  };
  url?: unknown;
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const UPSTREAM_TIMEOUT_MS = 115_000;
const DEFAULT_PERSISTENT_SCANNER_ENDPOINT =
  "https://maintenanceos-scanner-v2-production.up.railway.app/v1/onboarding/scan";
const rateBuckets = new Map<string, number[]>();

function allowRate(ip: string, now = Date.now()): boolean {
  const cutoff = now - RATE_WINDOW_MS;
  const previous = (rateBuckets.get(ip) ?? []).filter((stamp) => stamp > cutoff);
  if (previous.length >= RATE_MAX) {
    rateBuckets.set(ip, previous);
    return false;
  }
  previous.push(now);
  rateBuckets.set(ip, previous);
  return true;
}

function response(
  statusCode: number,
  body: unknown,
  origin = "",
): { statusCode: number; headers: Record<string, string>; body: unknown } {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return { statusCode, headers, body };
}

export async function proxyPersistentScan(
  url: string,
  fetcher: typeof fetch = fetch,
  endpoint =
    process.env.SCANNER_V2_RUNTIME_URL?.trim() ||
    DEFAULT_PERSISTENT_SCANNER_ENDPOINT,
): Promise<{ statusCode: number; body: unknown }> {
  try {
    const upstream = await fetcher(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const text = await upstream.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return {
        statusCode: 502,
        body: {
          ok: false,
          error: "upstream_invalid_response",
          message: "The persistent scan runtime returned an invalid response.",
          warnings: ["upstream_invalid_response"],
        },
      };
    }

    return { statusCode: upstream.status, body };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || /timeout/i.test(error.message));
    return {
      statusCode: timedOut ? 504 : 502,
      body: {
        ok: false,
        error: timedOut ? "timeout" : "upstream_unavailable",
        message: timedOut
          ? "The persistent scan runtime exceeded the bounded request time."
          : "The persistent scan runtime is unavailable.",
        warnings: [timedOut ? "timeout" : "upstream_unavailable"],
      },
    };
  }
}

export async function main(event: WebEvent = {}) {
  const method = event.http?.method?.toUpperCase() ?? "GET";
  const headers = event.http?.headers ?? {};
  const origin = headers.origin ?? "";
  const clientIp =
    (headers["x-forwarded-for"] ?? "unknown").split(",")[0]?.trim() ||
    "unknown";

  if (method === "OPTIONS") return response(204, "", origin);
  if (method !== "POST") {
    return response(405, { ok: false, error: "method_not_allowed" }, origin);
  }
  if (!allowRate(clientIp)) {
    return response(
      429,
      {
        ok: false,
        error: "rate_limited",
        message: "Too many scan requests. Try again shortly.",
      },
      origin,
    );
  }

  const url = typeof event.url === "string" ? event.url.trim() : "";
  if (!url) {
    return response(
      400,
      {
        ok: false,
        error: "invalid_url",
        message: "JSON body must include a string url.",
      },
      origin,
    );
  }

  const allowed = allowPublicHttpsUrl(url);
  if (!allowed.ok) {
    return response(
      400,
      {
        ok: false,
        error: allowed.reason,
        message: "Only public HTTPS business websites can be scanned.",
        warnings: [allowed.reason],
      },
      origin,
    );
  }

  const result = await proxyPersistentScan(allowed.url.toString());
  return response(result.statusCode, result.body, origin);
}
