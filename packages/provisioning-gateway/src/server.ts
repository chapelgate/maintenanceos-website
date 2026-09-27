#!/usr/bin/env node
/**
 * Internal-only MaintenanceOS Agent Factory provisioning gateway.
 * No browser CORS, no NEXT_PUBLIC config and no telephony/provider side effects.
 */

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  loadConnectorRegistryFromEnv,
  loadTtncSecretRegistryFromEnv,
} from "../../agent-adapters/src/registry.ts";
import type {
  ConnectorRegistry,
  TtncSecretRegistry,
} from "../../agent-adapters/src/types.ts";
import {
  authenticateProvisioningRequest,
  loadProvisioningPrincipalFromEnv,
  type ProvisioningAuthHeaders,
} from "./auth.ts";
import { prepareProvisioningAdapters } from "./adapters.ts";
import { provisionAgent } from "./engine.ts";
import { isProvisioningGatewayEnabled } from "./flags.ts";
import {
  createProvisioningStoreFromEnv,
} from "./store.ts";
import type {
  ProvisioningPrincipal,
  ProvisioningResult,
  ProvisioningStore,
} from "./types.ts";
import { provisioningFailure } from "./types.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8792;
export const MAX_BODY_BYTES = 256 * 1024;
const REQUEST_PATH = "/v1/provisioning/requests";
const ADAPTER_PREPARE_PATH = "/v1/provisioning/adapters/prepare";

export type ProvisioningServerOptions = {
  host?: string;
  port?: number;
  enabled?: boolean;
  principal?: ProvisioningPrincipal | null;
  store?: ProvisioningStore;
  connectorRegistry?: ConnectorRegistry;
  ttncSecrets?: TtncSecretRegistry;
  nowMs?: () => number;
  now?: () => Date;
};

function jsonHeaders(): Record<string, string> {
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
  res.writeHead(status, jsonHeaders());
  res.end(JSON.stringify(payload));
}

function pathnameOf(req: http.IncomingMessage): string {
  try {
    return (
      new URL(req.url ?? "/", "http://127.0.0.1").pathname.replace(/\/+$/, "") ||
      "/"
    );
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
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) {
      const error = new Error("payload too large");
      (error as Error & { code?: string }).code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function authHeaders(req: http.IncomingMessage): ProvisioningAuthHeaders {
  const header = (name: string): string | undefined => {
    const value = req.headers[name];
    return typeof value === "string" ? value.trim() : undefined;
  };
  return {
    keyId: header("x-mos-key-id"),
    timestamp: header("x-mos-timestamp"),
    nonce: header("x-mos-nonce"),
    signature: header("x-mos-signature"),
    idempotencyKey: header("idempotency-key"),
  };
}

function statusFor(result: ProvisioningResult): number {
  if (result.ok) return result.data.replayed ? 200 : 201;
  switch (result.error) {
    case "gateway_disabled":
    case "auth_not_configured":
      return 503;
    case "authentication_failed":
    case "replay_detected":
      return 401;
    case "tenant_forbidden":
    case "browser_origin_forbidden":
      return 403;
    case "provisioning_not_found":
      return 404;
    case "idempotency_conflict":
      return 409;
    case "invalid_blueprint":
    case "qualification_required":
    case "adapter_not_configured":
      return 422;
    case "payload_too_large":
      return 413;
    case "rate_limited":
      return 429;
    case "invalid_request":
      return 400;
    default:
      return 500;
  }
}

function parseBody(raw: Buffer): unknown {
  if (raw.length === 0) return null;
  return JSON.parse(raw.toString("utf8"));
}

export async function handleProvisioningRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ProvisioningServerOptions = {},
): Promise<void> {
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);
  const enabled = options.enabled ?? isProvisioningGatewayEnabled();
  const principal =
    options.principal === undefined
      ? loadProvisioningPrincipalFromEnv()
      : options.principal;
  const store = options.store ?? createProvisioningStoreFromEnv();

  if (method === "GET" && pathname === "/health") {
    send(res, 200, {
      ok: true,
      service: "maintenanceos-provisioning-gateway",
      gatewayEnabled: enabled,
      authConfigured: Boolean(principal),
      browserAccess: false,
      telephony: false,
      providerMutation: false,
      productDatabaseAccess: false,
      adapterPreparation: true,
      requestPath: REQUEST_PATH,
      adapterPreparePath: ADAPTER_PREPARE_PATH,
    });
    return;
  }

  if (pathname !== REQUEST_PATH && pathname !== ADAPTER_PREPARE_PATH) {
    send(res, 404, { ok: false, error: "Not found." });
    return;
  }

  if (req.headers.origin) {
    const result = provisioningFailure(
      "browser_origin_forbidden",
      "Browser-origin provisioning requests are forbidden.",
    );
    send(res, statusFor(result), result);
    return;
  }

  if (method !== "POST") {
    res.writeHead(405, {
      ...jsonHeaders(),
      Allow: "POST",
    });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed. POST JSON." }));
    return;
  }

  if (!enabled) {
    const result = provisioningFailure(
      "gateway_disabled",
      "Provisioning gateway is disabled.",
    );
    send(res, statusFor(result), result);
    return;
  }

  if (!principal) {
    const result = provisioningFailure(
      "auth_not_configured",
      "Provisioning authentication is not configured.",
    );
    send(res, statusFor(result), result);
    return;
  }

  const contentType = req.headers["content-type"];
  if (
    typeof contentType !== "string" ||
    !contentType.toLowerCase().startsWith("application/json")
  ) {
    const result = provisioningFailure(
      "invalid_request",
      "Provisioning requests require application/json.",
    );
    send(res, statusFor(result), result);
    return;
  }

  let raw: Buffer;
  try {
    raw = await readBody(req, MAX_BODY_BYTES);
  } catch {
    const result = provisioningFailure(
      "payload_too_large",
      "Provisioning request exceeds the maximum body size.",
    );
    send(res, statusFor(result), result);
    return;
  }

  const authenticated = authenticateProvisioningRequest({
    principal,
    headers: authHeaders(req),
    body: raw,
    store,
    nowMs: options.nowMs?.(),
    method,
    pathname,
  });
  if (!authenticated.ok) {
    send(
      res,
      statusFor(authenticated.failure),
      authenticated.failure,
    );
    return;
  }

  let parsed: unknown;
  try {
    parsed = parseBody(raw);
  } catch {
    const result = provisioningFailure(
      "invalid_request",
      "Provisioning request body is not valid JSON.",
    );
    send(res, statusFor(result), result);
    return;
  }

  const result =
    pathname === ADAPTER_PREPARE_PATH
      ? prepareProvisioningAdapters({
          request: parsed,
          principal: authenticated.principal,
          idempotencyKey: authenticated.idempotencyKey,
          store,
          registry:
            options.connectorRegistry ?? loadConnectorRegistryFromEnv(),
          ttncSecrets:
            options.ttncSecrets ?? loadTtncSecretRegistryFromEnv(),
          now: options.now,
        })
      : provisionAgent({
          request: parsed,
          principal: authenticated.principal,
          idempotencyKey: authenticated.idempotencyKey,
          store,
          now: options.now,
        });
  send(res, statusFor(result), result);
}

export function createProvisioningServer(
  options: ProvisioningServerOptions = {},
): http.Server {
  const enabled = options.enabled ?? isProvisioningGatewayEnabled();
  const principal =
    options.principal === undefined
      ? loadProvisioningPrincipalFromEnv()
      : options.principal;
  const store = options.store ?? createProvisioningStoreFromEnv();
  const connectorRegistry =
    options.connectorRegistry ?? loadConnectorRegistryFromEnv();
  const ttncSecrets =
    options.ttncSecrets ?? loadTtncSecretRegistryFromEnv();
  const shared = {
    ...options,
    enabled,
    principal,
    store,
    connectorRegistry,
    ttncSecrets,
  };

  return http.createServer((req, res) => {
    handleProvisioningRequest(req, res, shared).catch((error) => {
      console.error("[provisioning-gateway] unhandled", error);
      if (!res.headersSent) {
        const result = provisioningFailure(
          "internal_error",
          "Provisioning gateway failed closed.",
        );
        send(res, 500, result);
      }
    });
  });
}

export function resolveListenHost(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return env.PROVISIONING_GATEWAY_HOST?.trim() || DEFAULT_HOST;
}

export function resolveListenPort(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw =
    env.PROVISIONING_GATEWAY_PORT?.trim() || env.PORT?.trim();
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return DEFAULT_PORT;
  return port;
}

export function listenProvisioningServer(
  options: ProvisioningServerOptions = {},
): http.Server {
  const host = options.host ?? resolveListenHost();
  const port = options.port ?? resolveListenPort();
  const server = createProvisioningServer(options);
  server.listen(port, host, () => {
    console.log(
      "[provisioning-gateway] listening on http://" +
        host +
        ":" +
        port +
        REQUEST_PATH,
    );
    console.log(
      "[provisioning-gateway] adapter preparation " + ADAPTER_PREPARE_PATH,
    );
    console.log(
      "[provisioning-gateway] browser access disabled; adapters prepare only; no telephony/provider mutation",
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
  listenProvisioningServer();
}
