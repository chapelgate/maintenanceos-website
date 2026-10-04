#!/usr/bin/env node
/**
 * Standalone onboarding scan HTTP service.
 * Not a Next.js API route — safe for the static marketing export.
 *
 *   ONBOARDING_WEB_INGEST=true npm run onboarding-scan
 *   NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http://127.0.0.1:8788/v1/onboarding/scan
 */

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isWebIngestEnabled, runScan } from "./scan.ts";
import { isScannerV2Enabled } from "./scanner-v2-foundation.ts";
import { runPersistentScannerV2 } from "./scanner-v2-runtime.ts";
import { ScanError, type ScanResult } from "./types.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8788;
export const MAX_BODY_BYTES = 8 * 1024;
export const SCAN_PATHS = new Set([
  "/v1/onboarding/scan",
  "/v1/onboarding/scan/",
]);

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

export type ScanHandler = (url: string) => Promise<ScanResult>;

export type ServerOptions = {
  host?: string;
  port?: number;
  ingestEnabled?: boolean;
  scannerV2Enabled?: boolean;
  corsOrigin?: string;
  scan?: ScanHandler;
};

type RateBucket = number[];
const rateBuckets = new Map<string, RateBucket>();

export function corsHeaders(origin: string, configured?: string): Record<string, string> {
  const allow = configured || process.env.ONBOARDING_SCAN_CORS_ORIGIN || origin || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function jsonHeaders(
  origin: string,
  configured?: string,
): Record<string, string> {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders(origin, configured),
  };
}

function pathnameOf(req: http.IncomingMessage): string {
  try {
    return new URL(req.url ?? "/", "http://127.0.0.1").pathname;
  } catch {
    return "/";
  }
}

async function readBody(
  req: http.IncomingMessage,
  limit: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) {
      const error = new Error("payload too large");
      (error as Error & { code?: string }).code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function send(
  res: http.ServerResponse,
  status: number,
  origin: string,
  payload: unknown,
  configured?: string,
): void {
  res.writeHead(status, jsonHeaders(origin, configured));
  res.end(JSON.stringify(payload));
}

function clientIp(req: http.IncomingMessage): string {
  const raw = req.socket.remoteAddress ?? "unknown";
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw;
}

export function allowRate(ip: string, now = Date.now()): boolean {
  const cutoff = now - RATE_WINDOW_MS;
  const prev = (rateBuckets.get(ip) ?? []).filter((ts) => ts > cutoff);
  if (prev.length >= RATE_MAX) {
    rateBuckets.set(ip, prev);
    return false;
  }
  prev.push(now);
  rateBuckets.set(ip, prev);
  return true;
}

export function resetRateLimitForTests(): void {
  rateBuckets.clear();
}

function statusFor(result: ScanResult): number {
  if (result.ok) return 200;
  switch (result.error) {
    case "scan_disabled":
      return 503;
    case "http_not_allowed":
    case "unsupported_scheme":
    case "userinfo_not_allowed":
    case "invalid_url":
    case "non_public_host":
    case "non_public_resolved_ip":
      return 400;
    case "robots_disallow":
      return 422;
    case "timeout":
      return 504;
    case "fetch_failed":
    case "dns_failed":
    case "response_too_large":
    case "too_many_redirects":
      return 422;
    default:
      return 422;
  }
}

export async function handleScanRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ServerOptions = {},
): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const configured = options.corsOrigin;
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);
  const ingestEnabled = options.ingestEnabled ?? isWebIngestEnabled();
  const scannerV2Enabled =
    options.scannerV2Enabled ?? isScannerV2Enabled();

  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin, configured));
    res.end();
    return;
  }

  if (method === "GET" && (pathname === "/health" || pathname === "/health/")) {
    send(
      res,
      200,
      origin,
      {
        ok: true,
        service: "maintenanceos-onboarding-scan",
        ingestEnabled,
        scannerV2Enabled,
        sandboxCall: false,
        scanPath: "/v1/onboarding/scan",
      },
      configured,
    );
    return;
  }

  if (!SCAN_PATHS.has(pathname)) {
    send(res, 404, origin, { ok: false, error: "Not found." }, configured);
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, {
      ...jsonHeaders(origin, configured),
      Allow: "POST, OPTIONS",
    });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed. POST JSON { url }." }));
    return;
  }

  if (!ingestEnabled) {
    send(
      res,
      503,
      origin,
      {
        ok: false,
        error: "scan_disabled",
        message:
          "Onboarding web ingest is disabled. Set ONBOARDING_WEB_INGEST=true to enable crawling.",
        warnings: ["scan_disabled"],
      },
      configured,
    );
    return;
  }

  if (!allowRate(clientIp(req))) {
    send(
      res,
      429,
      origin,
      { ok: false, error: "rate_limited", message: "Too many scan requests. Try again shortly." },
      configured,
    );
    return;
  }

  let raw: Buffer;
  try {
    raw = await readBody(req, MAX_BODY_BYTES);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "PAYLOAD_TOO_LARGE") {
      send(res, 413, origin, { ok: false, error: "Payload too large." }, configured);
      return;
    }
    send(res, 400, origin, { ok: false, error: "Could not read request body." }, configured);
    return;
  }

  let parsed: unknown;
  try {
    parsed = raw.length === 0 ? {} : JSON.parse(raw.toString("utf8"));
  } catch {
    send(res, 400, origin, { ok: false, error: "Invalid JSON." }, configured);
    return;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    send(res, 400, origin, { ok: false, error: "JSON object required." }, configured);
    return;
  }

  const url = typeof (parsed as { url?: unknown }).url === "string"
    ? (parsed as { url: string }).url.trim()
    : "";
  if (!url) {
    send(
      res,
      400,
      origin,
      { ok: false, error: "invalid_url", message: "JSON body must include a string url." },
      configured,
    );
    return;
  }

  try {
    const result = options.scan
      ? await options.scan(url)
      : scannerV2Enabled
        ? await runPersistentScannerV2(url)
        : await runScan(url, { enabled: ingestEnabled });
    send(res, statusFor(result), origin, result, configured);
  } catch (err) {
    if (err instanceof ScanError) {
      send(
        res,
        err.httpStatus,
        origin,
        {
          ok: false,
          error: err.code,
          message: err.message,
          warnings: [err.code],
        },
        configured,
      );
      return;
    }
    send(
      res,
      500,
      origin,
      {
        ok: false,
        error: "internal_error",
        message: "The scan service failed. No crawl results were invented.",
      },
      configured,
    );
  }
}

export function createScanServer(options: ServerOptions = {}): http.Server {
  return http.createServer((req, res) => {
    handleScanRequest(req, res, options).catch((err) => {
      console.error("[onboarding-scan] unhandled", err);
      if (!res.headersSent) {
        const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
        send(res, 500, origin, {
          ok: false,
          error: "internal_error",
          message: "The scan service failed. No crawl results were invented.",
        }, options.corsOrigin);
      }
    });
  });
}

/** Loopback by default. Hosted companions must set `ONBOARDING_SCAN_HOST=0.0.0.0`. */
export function resolveListenHost(env: NodeJS.ProcessEnv = process.env): string {
  const host = env.ONBOARDING_SCAN_HOST?.trim();
  return host || DEFAULT_HOST;
}

/**
 * Prefer `ONBOARDING_SCAN_PORT` (local compose / docs), else `PORT` (droplet
 * and other hosts inject this). Invalid values fall back to 8788.
 */
export function resolveListenPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.ONBOARDING_SCAN_PORT?.trim() || env.PORT?.trim();
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return DEFAULT_PORT;
  return port;
}

export function listenScanServer(options: ServerOptions = {}): http.Server {
  const host = options.host ?? resolveListenHost();
  const port = options.port ?? resolveListenPort();
  const server = createScanServer(options);
  const enabled = options.ingestEnabled ?? isWebIngestEnabled();

  server.listen(port, host, () => {
    console.log(`[onboarding-scan] listening on http://${host}:${port}/v1/onboarding/scan`);
    console.log(`[onboarding-scan] health    http://${host}:${port}/health`);
    console.log(`[onboarding-scan] ONBOARDING_WEB_INGEST=${enabled ? "true" : "false"}`);
    console.log(
      `[onboarding-scan] ONBOARDING_SCANNER_V2=${
        (options.scannerV2Enabled ?? isScannerV2Enabled()) ? "true" : "false"
      }`,
    );
    console.log("[onboarding-scan] crawl text is untrusted data; no telephony; no invented fields");
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  return server;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isDirectRun()) {
  listenScanServer();
}
