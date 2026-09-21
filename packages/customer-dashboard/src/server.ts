#!/usr/bin/env node
/**
 * Standalone customer-dashboard HTTP companion.
 * Not a Next.js API route — safe for the static marketing export.
 *
 *   CUSTOMER_DASHBOARD_ENABLED=true npm run customer-dashboard
 *   NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=http://127.0.0.1:8791/v1/dashboard
 */

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  dashboardCatalogKindFromEnv,
  isCustomerDashboardEnabled,
} from "./flags.ts";
import { createDashboardStore } from "./store.ts";
import type { DashboardStore } from "./types.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8791;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

export type ServerOptions = {
  host?: string;
  port?: number;
  dashboardEnabled?: boolean;
  corsOrigin?: string;
  store?: DashboardStore;
};

type RateBucket = number[];
const rateBuckets = new Map<string, RateBucket>();

export function corsHeaders(origin: string, configured?: string): Record<string, string> {
  const allow = configured || process.env.CUSTOMER_DASHBOARD_CORS_ORIGIN || origin || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

function sessionIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/v1\/dashboard\/sessions\/([^/]+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function handleDashboardRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ServerOptions = {},
): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const configured = options.corsOrigin;
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);
  const dashboardEnabled = options.dashboardEnabled ?? isCustomerDashboardEnabled();
  const store =
    options.store ?? createDashboardStore(dashboardCatalogKindFromEnv());

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
        service: "maintenanceos-customer-dashboard",
        dashboardEnabled,
        catalogKind: store.kind,
        telephony: false,
        sessionsPath: "/v1/dashboard/sessions",
      },
      configured,
    );
    return;
  }

  const sessionId = sessionIdFromPath(pathname);
  const knownList = pathname === "/v1/dashboard/sessions" || pathname === "/v1/dashboard/bookings";
  if (!knownList && !sessionId) {
    send(res, 404, origin, { ok: false, error: "Not found." }, configured);
    return;
  }

  if (method !== "GET") {
    res.writeHead(405, {
      ...jsonHeaders(origin, configured),
      Allow: "GET, OPTIONS",
    });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed. GET JSON." }));
    return;
  }

  if (!dashboardEnabled) {
    send(
      res,
      503,
      origin,
      {
        ok: false,
        error: "dashboard_disabled",
        message:
          "Customer dashboard is disabled. Set CUSTOMER_DASHBOARD_ENABLED=true to enable. No live history is exposed.",
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
        message: "Too many dashboard requests. Try again shortly. No rows were invented.",
      },
      configured,
    );
    return;
  }

  if (pathname === "/v1/dashboard/sessions") {
    send(res, 200, origin, { ok: true, data: store.listSessions() }, configured);
    return;
  }
  if (pathname === "/v1/dashboard/bookings") {
    send(res, 200, origin, { ok: true, data: store.listBookings() }, configured);
    return;
  }

  const result = store.getSession(sessionId ?? "");
  if (!result.ok) {
    const status = result.error === "session_not_found" ? 404 : 400;
    send(res, status, origin, result, configured);
    return;
  }
  send(res, 200, origin, result, configured);
}

export function createDashboardServer(options: ServerOptions = {}): http.Server {
  const dashboardEnabled = options.dashboardEnabled ?? isCustomerDashboardEnabled();
  const shared: ServerOptions = {
    ...options,
    dashboardEnabled,
    store: options.store ?? createDashboardStore(dashboardCatalogKindFromEnv()),
  };
  return http.createServer((req, res) => {
    handleDashboardRequest(req, res, shared).catch((err) => {
      console.error("[customer-dashboard] unhandled", err);
      if (!res.headersSent) {
        const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
        send(
          res,
          500,
          origin,
          {
            ok: false,
            error: "internal_error",
            message: "The dashboard companion failed. No customers were invented.",
          },
          options.corsOrigin,
        );
      }
    });
  });
}

export function listenDashboardServer(options: ServerOptions = {}): http.Server {
  const host = options.host ?? process.env.CUSTOMER_DASHBOARD_HOST ?? DEFAULT_HOST;
  const port = Number(options.port ?? process.env.CUSTOMER_DASHBOARD_PORT ?? DEFAULT_PORT);
  const server = createDashboardServer(options);
  const enabled = options.dashboardEnabled ?? isCustomerDashboardEnabled();

  server.listen(port, host, () => {
    console.log(`[customer-dashboard] listening on http://${host}:${port}/v1/dashboard/sessions`);
    console.log(`[customer-dashboard] health    http://${host}:${port}/health`);
    console.log(`[customer-dashboard] CUSTOMER_DASHBOARD_ENABLED=${enabled ? "true" : "false"}`);
    console.log("[customer-dashboard] no telephony; SAMPLE rows only when demo catalogue is on");
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
  listenDashboardServer();
}
