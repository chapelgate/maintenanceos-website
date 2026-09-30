import { runScan } from "../../../src/scan.ts";
import type { ScanResult } from "../../../src/types.ts";

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

function statusFor(result: ScanResult): number {
  if (result.ok) return 200;
  switch (result.error) {
    case "scan_disabled":
      return 503;
    case "invalid_url":
    case "http_not_allowed":
    case "unsupported_scheme":
    case "userinfo_not_allowed":
    case "non_public_host":
    case "non_public_resolved_ip":
      return 400;
    case "timeout":
      return 504;
    default:
      return 422;
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

  try {
    const result = await runScan(url, { enabled: true });
    return response(statusFor(result), result, origin);
  } catch {
    return response(
      500,
      {
        ok: false,
        error: "internal_error",
        message: "The scan service failed. No crawl results were invented.",
        warnings: ["internal_error"],
      },
      origin,
    );
  }
}
