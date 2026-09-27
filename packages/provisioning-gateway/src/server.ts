#!/usr/bin/env node
/**
 * Internal-only MaintenanceOS Agent Factory provisioning gateway.
 * No browser CORS, no NEXT_PUBLIC config and no telephony/provider side effects.
 */

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  authenticateProvisioningRequest,
  loadProvisioningPrincipalFromEnv,
  type ProvisioningAuthHeaders,
} from "./auth.ts";
import { provisionAgent } from "./engine.ts";
import {
  adapterBindingsHash,
  prepareAdapterReadiness,
  readinessMatchesProvisioning,
} from "./adapters/engine.ts";
import { loadAdapterRegistryFromEnv } from "./adapters/registry.ts";
import { fetchAdapterTransport } from "./adapters/transport.ts";
import type {
  AdapterBinding,
  AdapterRegistry,
  AdapterTransport,
} from "./adapters/types.ts";
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
import { INTEGRATION_KINDS, type IntegrationKind } from "../../../src/lib/agent-blueprint.ts";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8792;
export const MAX_BODY_BYTES = 256 * 1024;
const REQUEST_PATH = "/v1/provisioning/requests";
const ADAPTER_PATH = "/v1/provisioning/adapters/prepare";

export type ProvisioningServerOptions = {
  host?: string;
  port?: number;
  enabled?: boolean;
  principal?: ProvisioningPrincipal | null;
  store?: ProvisioningStore;
  nowMs?: () => number;
  now?: () => Date;
  env?: NodeJS.ProcessEnv;
  adapterRegistry?: AdapterRegistry;
  adapterTransport?: AdapterTransport;
  adapterMutationsEnabled?: boolean;
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
    case "idempotency_conflict":
      return 409;
    case "invalid_blueprint":
    case "qualification_required":
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

function adapterMutationsFromEnv(env: NodeJS.ProcessEnv): boolean {
  const value = env.ADAPTER_MUTATIONS_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1";
}

function parseAdapterBody(
  value: unknown,
): { provisioningId: string; bindings: AdapterBinding[] } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (
    keys.length !== 2 ||
    keys[0] !== "bindings" ||
    keys[1] !== "provisioningId" ||
    typeof record.provisioningId !== "string" ||
    !/^prv_[0-9a-f]{24}$/.test(record.provisioningId) ||
    !Array.isArray(record.bindings)
  ) {
    return null;
  }
  const bindings: AdapterBinding[] = [];
  for (const item of record.bindings) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const binding = item as Record<string, unknown>;
    const bindingKeys = Object.keys(binding).sort();
    if (
      bindingKeys.length !== 2 ||
      bindingKeys[0] !== "connectorRef" ||
      bindingKeys[1] !== "kind" ||
      typeof binding.kind !== "string" ||
      !INTEGRATION_KINDS.includes(binding.kind as IntegrationKind) ||
      typeof binding.connectorRef !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(binding.connectorRef)
    ) {
      return null;
    }
    bindings.push({
      kind: binding.kind as IntegrationKind,
      connectorRef: binding.connectorRef,
    });
  }
  return { provisioningId: record.provisioningId, bindings };
}

function adapterStatus(error: string): number {
  switch (error) {
    case "tenant_forbidden":
      return 403;
    case "invalid_bindings":
    case "invalid_provisioning":
      return 400;
    case "connector_not_found":
    case "connector_kind_mismatch":
      return 422;
    case "connector_not_configured":
    case "adapter_not_ready":
    case "provider_error":
      return 503;
    default:
      return 500;
  }
}

export async function handleProvisioningRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ProvisioningServerOptions = {},
): Promise<void> {
  const method = (req.method ?? "GET").toUpperCase();
  const pathname = pathnameOf(req);
  const env = options.env ?? process.env;
  const enabled = options.enabled ?? isProvisioningGatewayEnabled(env);
  const adapterMutationsEnabled =
    options.adapterMutationsEnabled ?? adapterMutationsFromEnv(env);
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
      providerMutationEnabled: adapterMutationsEnabled,
      productDatabaseAccess: false,
      requestPath: REQUEST_PATH,
      adapterPath: ADAPTER_PATH,
    });
    return;
  }

  if (pathname !== REQUEST_PATH && pathname !== ADAPTER_PATH) {
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

  if (pathname === ADAPTER_PATH) {
    const body = parseAdapterBody(parsed);
    if (!body) {
      send(res, 400, {
        ok: false,
        error: "invalid_request",
        message: "Adapter request must contain provisioningId and valid connector bindings.",
      });
      return;
    }
    const provisioning = store.getProvisioning(body.provisioningId);
    if (!provisioning) {
      send(res, 404, {
        ok: false,
        error: "invalid_provisioning",
        message: "Provisioning record was not found.",
      });
      return;
    }

    const existing = store.getAdapterReadiness(body.provisioningId);
    const requestedHash = adapterBindingsHash(body.bindings);
    if (existing) {
      if (
        existing.bindingsHash === requestedHash &&
        readinessMatchesProvisioning(existing, provisioning)
      ) {
        send(res, 200, { ok: true, data: existing, replayed: true });
        return;
      }
      send(res, 409, {
        ok: false,
        error: "idempotency_conflict",
        message: "Adapter readiness already exists for this provisioning record with different bindings.",
      });
      return;
    }

    let registry: AdapterRegistry;
    try {
      registry = options.adapterRegistry ?? loadAdapterRegistryFromEnv(env);
    } catch {
      send(res, 503, {
        ok: false,
        error: "connector_not_configured",
        message: "Server-side adapter connector registry is not configured.",
      });
      return;
    }

    const prepared = await prepareAdapterReadiness({
      provisioning,
      principal: authenticated.principal,
      bindings: body.bindings,
      registry,
      env,
      transport: options.adapterTransport ?? fetchAdapterTransport,
      mutationsEnabled: adapterMutationsEnabled,
      now: options.now,
    });
    if (!prepared.ok) {
      send(res, adapterStatus(prepared.error), prepared);
      return;
    }
    store.putAdapterReadiness(prepared.record);
    send(res, 201, { ok: true, data: prepared.record, replayed: false });
    return;
  }

  const result = provisionAgent({
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
  const enabled = options.enabled ?? isProvisioningGatewayEnabled(options.env ?? process.env);
  const principal =
    options.principal === undefined
      ? loadProvisioningPrincipalFromEnv()
      : options.principal;
  const store = options.store ?? createProvisioningStoreFromEnv();
  const shared = { ...options, enabled, principal, store };

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
      "[provisioning-gateway] browser access disabled; adapter provider mutation=" +
        String(options.adapterMutationsEnabled ?? adapterMutationsFromEnv(options.env ?? process.env)),
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
