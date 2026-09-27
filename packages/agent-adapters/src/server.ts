#!/usr/bin/env node
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isAgentAdapterWebhookEnabled } from "./flags.ts";
import {
  loadConnectorRegistryFromEnv,
  loadTtncSecretRegistryFromEnv,
} from "./registry.ts";
import {
  parseTtncWebhook,
  verifyTtncWebhookSignature,
} from "./ttnc.ts";
import type {
  ConnectorRegistry,
  TtncSecretRegistry,
} from "./types.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8793;
export const MAX_BODY_BYTES = 64 * 1024;
const TTNC_PATH = /^\/v1\/telephony\/ttnc\/([A-Za-z0-9][A-Za-z0-9._:-]{0,127})\/webhook$/;

export type AgentAdapterServerOptions = {
  host?: string;
  port?: number;
  enabled?: boolean;
  registry?: ConnectorRegistry;
  ttncSecrets?: TtncSecretRegistry;
};

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}

function send(
  res: http.ServerResponse,
  status: number,
  payload: unknown,
): void {
  res.writeHead(status, headers());
  res.end(JSON.stringify(payload));
}

async function readBody(req: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("payload_too_large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export async function handleAgentAdapterRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: AgentAdapterServerOptions = {},
): Promise<void> {
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
  const enabled = options.enabled ?? isAgentAdapterWebhookEnabled();
  const registry = options.registry ?? loadConnectorRegistryFromEnv();
  const ttncSecrets =
    options.ttncSecrets ?? loadTtncSecretRegistryFromEnv();

  if (method === "GET" && pathname === "/health") {
    send(res, 200, {
      ok: true,
      service: "maintenanceos-agent-adapters",
      webhookEnabled: enabled,
      browserAccess: false,
      providerMutation: false,
      telephonyActivation: false,
      ttncWebhookVerification: "hmac-sha256-raw-body",
    });
    return;
  }

  if (req.headers.origin) {
    send(res, 403, {
      ok: false,
      error: "browser_origin_forbidden",
    });
    return;
  }

  const match = TTNC_PATH.exec(pathname);
  if (!match) {
    send(res, 404, { ok: false, error: "not_found" });
    return;
  }
  if (method !== "POST") {
    res.writeHead(405, { ...headers(), Allow: "POST" });
    res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }
  if (!enabled) {
    send(res, 503, { ok: false, error: "adapter_webhooks_disabled" });
    return;
  }

  const connectorRef = match[1];
  const connector = registry.get(connectorRef);
  if (
    !connector ||
    connector.kind !== "telephony" ||
    connector.provider !== "ttnc"
  ) {
    send(res, 404, { ok: false, error: "connector_not_found" });
    return;
  }
  const secret = ttncSecrets.getWebhookSecret(connectorRef);
  if (!secret) {
    send(res, 503, { ok: false, error: "connector_secret_not_configured" });
    return;
  }

  let raw: Buffer;
  try {
    raw = await readBody(req);
  } catch {
    send(res, 413, { ok: false, error: "payload_too_large" });
    return;
  }

  const signature =
    typeof req.headers["webhook-signature"] === "string"
      ? req.headers["webhook-signature"].trim()
      : undefined;
  if (
    !verifyTtncWebhookSignature({
      rawBody: raw,
      signature,
      secret,
    })
  ) {
    send(res, 401, { ok: false, error: "invalid_signature" });
    return;
  }

  try {
    const event = parseTtncWebhook(raw);
    send(res, 202, {
      ok: true,
      accepted: true,
      event: {
        eventType: event.eventType,
        ref: event.ref,
      },
      sideEffects: false,
    });
  } catch {
    send(res, 400, { ok: false, error: "invalid_event" });
  }
}

export function createAgentAdapterServer(
  options: AgentAdapterServerOptions = {},
): http.Server {
  const registry = options.registry ?? loadConnectorRegistryFromEnv();
  const ttncSecrets =
    options.ttncSecrets ?? loadTtncSecretRegistryFromEnv();
  const enabled = options.enabled ?? isAgentAdapterWebhookEnabled();
  return http.createServer((req, res) => {
    handleAgentAdapterRequest(req, res, {
      ...options,
      registry,
      ttncSecrets,
      enabled,
    }).catch(() => {
      if (!res.headersSent) {
        send(res, 500, { ok: false, error: "internal_error" });
      }
    });
  });
}

export function resolveListenHost(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return env.AGENT_ADAPTER_HOST?.trim() || DEFAULT_HOST;
}

export function resolveListenPort(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env.AGENT_ADAPTER_PORT?.trim() || env.PORT?.trim();
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  return Number.isInteger(port) && port > 0 && port <= 65535
    ? port
    : DEFAULT_PORT;
}

export function listenAgentAdapterServer(
  options: AgentAdapterServerOptions = {},
): http.Server {
  const host = options.host ?? resolveListenHost();
  const port = options.port ?? resolveListenPort();
  const server = createAgentAdapterServer(options);
  server.listen(port, host, () => {
    console.log(
      "[agent-adapters] listening on http://" +
        host +
        ":" +
        port,
    );
    console.log(
      "[agent-adapters] TTNC webhook verification only; no carrier mutation or activation",
    );
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  return server;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isDirectRun()) listenAgentAdapterServer();
