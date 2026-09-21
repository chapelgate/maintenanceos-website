#!/usr/bin/env node
/**
 * Standalone calendar adapter HTTP companion.
 * Not a Next.js API route — safe for the static marketing export.
 *
 *   CALENDAR_ADAPTERS_ENABLED=true npm run calendar-adapters
 *   NEXT_PUBLIC_CALENDAR_ENDPOINT=http://127.0.0.1:8789/v1/calendar
 */

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCalendarAdapter } from "./factory.ts";
import { isCalendarAdaptersEnabled, calendarProviderFromEnv } from "./flags.ts";
import {
  GOOGLE_OAUTH_CALLBACK_PATH,
  GOOGLE_OAUTH_START_PATH,
  MICROSOFT_OAUTH_CALLBACK_PATH,
  MICROSOFT_OAUTH_START_PATH,
  handleGoogleOAuthCallback,
  handleGoogleOAuthStart,
  handleMicrosoftOAuthCallback,
  handleMicrosoftOAuthStart,
} from "./oauth-http.ts";
import {
  createMemoryOauthStateStore,
  googleOAuthStatus,
  microsoftOAuthStatus,
  type OauthStateStore,
} from "./oauth.ts";
import { createTokenStoreFromEnv, type TokenStore } from "./tokens.ts";
import type { CalendarAdapter, CalendarResult, FetchLike } from "./types.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8789;
export const MAX_BODY_BYTES = 8 * 1024;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

const defaultOauthStateStore = createMemoryOauthStateStore();

export type ServerOptions = {
  host?: string;
  port?: number;
  adaptersEnabled?: boolean;
  corsOrigin?: string;
  adapter?: CalendarAdapter;
  env?: NodeJS.ProcessEnv;
  tokenStore?: TokenStore;
  oauthStateStore?: OauthStateStore;
  fetch?: FetchLike;
};

type RateBucket = number[];
const rateBuckets = new Map<string, RateBucket>();

export function corsHeaders(origin: string, configured?: string): Record<string, string> {
  const allow = configured || process.env.CALENDAR_ADAPTERS_CORS_ORIGIN || origin || "*";
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

function statusFor<T>(result: CalendarResult<T>): number {
  if (result.ok) return 200;
  switch (result.error) {
    case "calendar_disabled":
      return 503;
    case "not_configured":
    case "auth_failed":
      return 503;
    case "invalid_range":
    case "invalid_request":
      return 400;
    case "slot_unavailable":
      return 409;
    case "booking_not_found":
      return 404;
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

export async function handleCalendarRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ServerOptions = {},
): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const configured = options.corsOrigin;
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);
  const env = options.env ?? process.env;
  const adaptersEnabled = options.adaptersEnabled ?? isCalendarAdaptersEnabled(env);
  const tokenStore = options.tokenStore ?? createTokenStoreFromEnv(env);
  const oauthStateStore = options.oauthStateStore ?? defaultOauthStateStore;
  const adapter =
    options.adapter ??
    createCalendarAdapter({ enabled: adaptersEnabled, env, tokenStore, fetch: options.fetch });

  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin, configured));
    res.end();
    return;
  }

  if (method === "GET" && pathname === "/health") {
    const google = await googleOAuthStatus(env, tokenStore);
    const microsoft = await microsoftOAuthStatus(env, tokenStore);
    send(
      res,
      200,
      origin,
      {
        ok: true,
        service: "maintenanceos-calendar-adapters",
        adaptersEnabled,
        provider: calendarProviderFromEnv(env),
        telephony: false,
        googleCalendarLiveOnStaging: false,
        microsoftCalendarLiveOnStaging: false,
        googleOAuth: {
          clientConfigured: google.clientConfigured,
          tokenPresent: google.tokenPresent,
          startPath: GOOGLE_OAUTH_START_PATH,
          callbackPath: GOOGLE_OAUTH_CALLBACK_PATH,
        },
        microsoftOAuth: {
          clientConfigured: microsoft.clientConfigured,
          tokenPresent: microsoft.tokenPresent,
          startPath: MICROSOFT_OAUTH_START_PATH,
          callbackPath: MICROSOFT_OAUTH_CALLBACK_PATH,
        },
        slotsPath: "/v1/calendar/slots",
      },
      configured,
    );
    return;
  }

  if (method === "GET" && pathname === GOOGLE_OAUTH_START_PATH) {
    const result = handleGoogleOAuthStart({
      adaptersEnabled,
      env,
      tokenStore,
      oauthStateStore,
      fetch: options.fetch,
      extraHeaders: corsHeaders(origin, configured),
    });
    res.writeHead(result.status, result.headers);
    res.end(result.body);
    return;
  }

  if (method === "GET" && pathname === GOOGLE_OAUTH_CALLBACK_PATH) {
    const result = await handleGoogleOAuthCallback(req.url ?? "/", {
      adaptersEnabled,
      env,
      tokenStore,
      oauthStateStore,
      fetch: options.fetch,
      extraHeaders: corsHeaders(origin, configured),
    });
    res.writeHead(result.status, result.headers);
    res.end(result.body);
    return;
  }

  if (method === "GET" && pathname === MICROSOFT_OAUTH_START_PATH) {
    const result = handleMicrosoftOAuthStart({
      adaptersEnabled,
      env,
      tokenStore,
      oauthStateStore,
      fetch: options.fetch,
      extraHeaders: corsHeaders(origin, configured),
    });
    res.writeHead(result.status, result.headers);
    res.end(result.body);
    return;
  }

  if (method === "GET" && pathname === MICROSOFT_OAUTH_CALLBACK_PATH) {
    const result = await handleMicrosoftOAuthCallback(req.url ?? "/", {
      adaptersEnabled,
      env,
      tokenStore,
      oauthStateStore,
      fetch: options.fetch,
      extraHeaders: corsHeaders(origin, configured),
    });
    res.writeHead(result.status, result.headers);
    res.end(result.body);
    return;
  }

  const known = new Set([
    "/v1/calendar/slots",
    "/v1/calendar/bookings",
    "/v1/calendar/bookings/cancel",
    "/v1/calendar/bookings/reschedule",
  ]);
  if (!known.has(pathname)) {
    send(res, 404, origin, { ok: false, error: "Not found." }, configured);
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, {
      ...jsonHeaders(origin, configured),
      Allow: "POST, OPTIONS",
    });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed. POST JSON." }));
    return;
  }

  if (!adaptersEnabled) {
    send(
      res,
      503,
      origin,
      {
        ok: false,
        error: "calendar_disabled",
        message:
          "Calendar adapters are disabled. Set CALENDAR_ADAPTERS_ENABLED=true to enable. No booking was created.",
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
      {
        ok: false,
        error: "rate_limited",
        message: "Too many calendar requests. Try again shortly. No booking was created.",
      },
      configured,
    );
    return;
  }

  const parsed = await parseJsonObject(req);
  if (!parsed.ok) {
    const status = parsed.error === "payload_too_large" ? 413 : 400;
    send(res, status, origin, { ok: false, error: parsed.error }, configured);
    return;
  }
  const body = parsed.value;

  try {
    if (pathname === "/v1/calendar/slots") {
      const result = await adapter.listFreeSlots({
        from: asString(body.from),
        to: asString(body.to),
        timezone: asString(body.timezone) || undefined,
        durationMinutes:
          typeof body.durationMinutes === "number" ? body.durationMinutes : undefined,
      });
      send(res, statusFor(result), origin, result, configured);
      return;
    }
    if (pathname === "/v1/calendar/bookings") {
      const result = await adapter.createBooking({
        start: asString(body.start),
        end: asString(body.end),
        timezone: asString(body.timezone) || undefined,
        title: asString(body.title) || undefined,
        attendeeEmail: asString(body.attendeeEmail) || undefined,
        notes: asString(body.notes) || undefined,
      });
      send(res, statusFor(result), origin, result, configured);
      return;
    }
    if (pathname === "/v1/calendar/bookings/cancel") {
      const result = await adapter.cancelBooking({ id: asString(body.id) });
      send(res, statusFor(result), origin, result, configured);
      return;
    }
    const result = await adapter.rescheduleBooking({
      id: asString(body.id),
      start: asString(body.start),
      end: asString(body.end),
      timezone: asString(body.timezone) || undefined,
    });
    send(res, statusFor(result), origin, result, configured);
  } catch {
    send(
      res,
      500,
      origin,
      {
        ok: false,
        error: "internal_error",
        message: "The calendar adapter failed. No booking was invented.",
      },
      configured,
    );
  }
}

export function createCalendarServer(options: ServerOptions = {}): http.Server {
  const env = options.env ?? process.env;
  const adaptersEnabled = options.adaptersEnabled ?? isCalendarAdaptersEnabled(env);
  const tokenStore = options.tokenStore ?? createTokenStoreFromEnv(env);
  const oauthStateStore = options.oauthStateStore ?? createMemoryOauthStateStore();
  const shared: ServerOptions = {
    ...options,
    env,
    adaptersEnabled,
    tokenStore,
    oauthStateStore,
    adapter:
      options.adapter ??
      createCalendarAdapter({
        enabled: adaptersEnabled,
        env,
        tokenStore,
        fetch: options.fetch,
      }),
  };
  return http.createServer((req, res) => {
    handleCalendarRequest(req, res, shared).catch((err) => {
      console.error("[calendar-adapters] unhandled", err);
      if (!res.headersSent) {
        const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
        send(
          res,
          500,
          origin,
          {
            ok: false,
            error: "internal_error",
            message: "The calendar adapter failed. No booking was invented.",
          },
          options.corsOrigin,
        );
      }
    });
  });
}

/** Loopback by default. Hosted companions must set `CALENDAR_ADAPTERS_HOST=0.0.0.0`. */
export function resolveListenHost(env: NodeJS.ProcessEnv = process.env): string {
  const host = env.CALENDAR_ADAPTERS_HOST?.trim();
  return host || DEFAULT_HOST;
}

/**
 * Prefer `CALENDAR_ADAPTERS_PORT` (local compose / docs), else `PORT` (Render and
 * other PaaS inject this). Invalid values fall back to 8789.
 */
export function resolveListenPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.CALENDAR_ADAPTERS_PORT?.trim() || env.PORT?.trim();
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return DEFAULT_PORT;
  return port;
}

export function listenCalendarServer(options: ServerOptions = {}): http.Server {
  const host = options.host ?? resolveListenHost();
  const port = options.port ?? resolveListenPort();
  const server = createCalendarServer(options);
  const enabled = options.adaptersEnabled ?? isCalendarAdaptersEnabled();

  server.listen(port, host, () => {
    console.log(`[calendar-adapters] listening on http://${host}:${port}/v1/calendar/slots`);
    console.log(`[calendar-adapters] health    http://${host}:${port}/health`);
    console.log(
      `[calendar-adapters] google oauth start http://${host}:${port}${GOOGLE_OAUTH_START_PATH}`,
    );
    console.log(
      `[calendar-adapters] microsoft oauth start http://${host}:${port}${MICROSOFT_OAUTH_START_PATH}`,
    );
    console.log(`[calendar-adapters] CALENDAR_ADAPTERS_ENABLED=${enabled ? "true" : "false"}`);
    console.log(`[calendar-adapters] provider=${calendarProviderFromEnv()}`);
    console.log(
      "[calendar-adapters] no telephony; mock default; Google/Microsoft Calendar is not live on staging",
    );
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
  listenCalendarServer();
}
