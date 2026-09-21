#!/usr/bin/env node
/**
 * Standalone sandbox test-call HTTP companion.
 * Not a Next.js API route — safe for the static marketing export.
 *
 *   SANDBOX_TEST_CALL_ENABLED=true npm run sandbox-test-call
 *   NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=http://127.0.0.1:8790/v1/sandbox
 */

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createSandboxEngine, type SandboxEngine } from "./engine.ts";
import { isSandboxTestCallEnabled } from "./flags.ts";
import type { SandboxResult } from "./types.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8790;
export const MAX_BODY_BYTES = 16 * 1024;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

export type ServerOptions = {
  host?: string;
  port?: number;
  sandboxEnabled?: boolean;
  corsOrigin?: string;
  engine?: SandboxEngine;
};

type RateBucket = number[];
const rateBuckets = new Map<string, RateBucket>();

export function corsHeaders(origin: string, configured?: string): Record<string, string> {
  const allow = configured || process.env.SANDBOX_TEST_CALL_CORS_ORIGIN || origin || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    return new URL(req.url ?? "/", "http://127.0.0.1").pathname.replace(/\/+$/, "") || "/";
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

function statusFor<T>(result: SandboxResult<T>): number {
  if (result.ok) return 200;
  switch (result.error) {
    case "sandbox_disabled":
      return 503;
    case "not_configured":
      return 503;
    case "live_call_forbidden":
      return 403;
    case "session_not_found":
      return 404;
    case "invalid_request":
      return 400;
    default:
      return 422;
  }
}

async function parseJsonObject(
  req: http.IncomingMessage,
): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false; error: string }> {
  let raw: Buffer;
  try {
    raw = await readBody(req, MAX_BODY_BYTES);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "PAYLOAD_TOO_LARGE") {
      return { ok: false, error: "payload_too_large" };
    }
    return { ok: false, error: "bad_body" };
  }
  try {
    const parsed = raw.length === 0 ? {} : JSON.parse(raw.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "not_object" };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const SESSION_RE = /^\/v1\/sandbox\/sessions\/([^/]+)$/;
const TEST_RE = /^\/v1\/sandbox\/sessions\/([^/]+)\/test-call$/;

export async function handleSandboxRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ServerOptions = {},
): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const configured = options.corsOrigin;
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);
  const sandboxEnabled = options.sandboxEnabled ?? isSandboxTestCallEnabled();
  const engine =
    options.engine ?? createSandboxEngine({ enabled: sandboxEnabled });

  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin, configured));
    res.end();
    return;
  }

  if (method === "GET" && pathname === "/health") {
    send(
      res,
      200,
      origin,
      {
        ok: true,
        service: "maintenanceos-sandbox-test-call",
        sandboxEnabled,
        telephony: false,
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
        frozenLivePathUntouched: true,
        sessionsPath: "/v1/sandbox/sessions",
      },
      configured,
    );
    return;
  }

  const sessionMatch = pathname.match(SESSION_RE);
  const testMatch = pathname.match(TEST_RE);
  const createPath = pathname === "/v1/sandbox/sessions";

  if (!createPath && !sessionMatch && !testMatch) {
    send(res, 404, origin, { ok: false, error: "Not found." }, configured);
    return;
  }

  if (!sandboxEnabled) {
    send(
      res,
      503,
      origin,
      {
        ok: false,
        error: "sandbox_disabled",
        message:
          "Sandbox test call is disabled. Set SANDBOX_TEST_CALL_ENABLED=true to enable. No live call was placed.",
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
      },
      configured,
    );
    return;
  }

  if (method === "GET" && sessionMatch) {
    const result = engine.describeSession(decodeURIComponent(sessionMatch[1]));
    send(res, statusFor(result), origin, result, configured);
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, {
      ...jsonHeaders(origin, configured),
      Allow: createPath || testMatch ? "POST, OPTIONS" : "GET, POST, OPTIONS",
    });
    res.end(
      JSON.stringify({
        ok: false,
        error: "Method not allowed.",
        liveCall: false,
      }),
    );
    return;
  }

  if (!allowRate(clientIp(req))) {
    send(
      res,
      429,
      origin,
      {
        ok: false,
        error: "rate_limited",
        message: "Too many sandbox requests. Try again shortly. No live call was placed.",
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
      },
      configured,
    );
    return;
  }

  const parsed = await parseJsonObject(req);
  if (!parsed.ok) {
    const status = parsed.error === "payload_too_large" ? 413 : 400;
    send(
      res,
      status,
      origin,
      {
        ok: false,
        error: parsed.error,
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
      },
      configured,
    );
    return;
  }
  const body = parsed.value;

  try {
    if (createPath) {
      const result = engine.createSession({
        businessName: asString(body.businessName),
        greeting: asString(body.greeting),
        hours: asString(body.hours),
        services: asString(body.services),
        faqs: asString(body.faqs),
      });
      send(res, statusFor(result), origin, result, configured);
      return;
    }
    if (testMatch) {
      const result = engine.startTest({
        sessionId: decodeURIComponent(testMatch[1]),
        mode: asString(body.mode) || undefined,
      });
      send(res, statusFor(result), origin, result, configured);
      return;
    }
    send(res, 405, origin, { ok: false, error: "Method not allowed." }, configured);
  } catch {
    send(
      res,
      500,
      origin,
      {
        ok: false,
        error: "internal_error",
        message: "The sandbox service failed. No live call was placed.",
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
      },
      configured,
    );
  }
}

export function createSandboxServer(options: ServerOptions = {}): http.Server {
  const sandboxEnabled = options.sandboxEnabled ?? isSandboxTestCallEnabled();
  const shared: ServerOptions = {
    ...options,
    sandboxEnabled,
    engine: options.engine ?? createSandboxEngine({ enabled: sandboxEnabled }),
  };
  return http.createServer((req, res) => {
    handleSandboxRequest(req, res, shared).catch((err) => {
      console.error("[sandbox-test-call] unhandled", err);
      if (!res.headersSent) {
        const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
        send(
          res,
          500,
          origin,
          {
            ok: false,
            error: "internal_error",
            message: "The sandbox service failed. No live call was placed.",
            liveCall: false,
            liveNumber: null,
            productionTelephony: false,
          },
          options.corsOrigin,
        );
      }
    });
  });
}

/** Loopback by default. Hosted companions must set `SANDBOX_TEST_CALL_HOST=0.0.0.0`. */
export function resolveListenHost(env: NodeJS.ProcessEnv = process.env): string {
  const host = env.SANDBOX_TEST_CALL_HOST?.trim();
  return host || DEFAULT_HOST;
}

/**
 * Prefer `SANDBOX_TEST_CALL_PORT` (local compose / docs), else `PORT` (Render and
 * other PaaS inject this). Invalid values fall back to 8790.
 */
export function resolveListenPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.SANDBOX_TEST_CALL_PORT?.trim() || env.PORT?.trim();
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return DEFAULT_PORT;
  return port;
}

export function listenSandboxServer(options: ServerOptions = {}): http.Server {
  const host = options.host ?? resolveListenHost();
  const port = options.port ?? resolveListenPort();
  const server = createSandboxServer(options);
  const enabled = options.sandboxEnabled ?? isSandboxTestCallEnabled();

  server.listen(port, host, () => {
    console.log(`[sandbox-test-call] listening on http://${host}:${port}/v1/sandbox/sessions`);
    console.log(`[sandbox-test-call] health    http://${host}:${port}/health`);
    console.log(`[sandbox-test-call] SANDBOX_TEST_CALL_ENABLED=${enabled ? "true" : "false"}`);
    console.log("[sandbox-test-call] no live telephony; no invented phone call; frozen path untouched");
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
  listenSandboxServer();
}
