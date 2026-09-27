import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type {
  ProvisioningFailure,
  ProvisioningPrincipal,
  ProvisioningStore,
} from "./types.ts";
import { provisioningFailure } from "./types.ts";

export const AUTH_WINDOW_MS = 5 * 60 * 1000;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
const NONCE = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const SIGNATURE = /^[0-9a-f]{64}$/;

export type ProvisioningAuthHeaders = {
  keyId?: string;
  timestamp?: string;
  nonce?: string;
  signature?: string;
  idempotencyKey?: string;
};

export type ProvisioningAuthSuccess = {
  ok: true;
  principal: ProvisioningPrincipal;
  idempotencyKey: string;
};

export type ProvisioningAuthResult =
  | ProvisioningAuthSuccess
  | { ok: false; failure: ProvisioningFailure };

function sha256Hex(body: Buffer | string): string {
  return createHash("sha256").update(body).digest("hex");
}

export function provisioningSigningPayload(input: {
  method: string;
  pathname: string;
  timestamp: string;
  nonce: string;
  idempotencyKey: string;
  body: Buffer | string;
}): string {
  return [
    input.method.toUpperCase(),
    input.pathname,
    input.timestamp,
    input.nonce,
    input.idempotencyKey,
    sha256Hex(input.body),
  ].join("\n");
}

export function signProvisioningRequest(input: {
  secret: string;
  method?: string;
  pathname?: string;
  timestamp: string;
  nonce: string;
  idempotencyKey: string;
  body: Buffer | string;
}): string {
  const payload = provisioningSigningPayload({
    method: input.method ?? "POST",
    pathname: input.pathname ?? "/v1/provisioning/requests",
    timestamp: input.timestamp,
    nonce: input.nonce,
    idempotencyKey: input.idempotencyKey,
    body: input.body,
  });
  return createHmac("sha256", input.secret).update(payload).digest("hex");
}

function safeSignatureEqual(expected: string, supplied: string): boolean {
  if (!SIGNATURE.test(supplied)) return false;
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(supplied, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function authenticateProvisioningRequest(input: {
  principal: ProvisioningPrincipal;
  headers: ProvisioningAuthHeaders;
  body: Buffer;
  store: ProvisioningStore;
  nowMs?: number;
  method?: string;
  pathname?: string;
}): ProvisioningAuthResult {
  const nowMs = input.nowMs ?? Date.now();
  const method = input.method ?? "POST";
  const pathname = input.pathname ?? "/v1/provisioning/requests";
  const { keyId, timestamp, nonce, signature, idempotencyKey } = input.headers;

  if (
    !keyId ||
    !timestamp ||
    !nonce ||
    !signature ||
    !idempotencyKey ||
    !ID.test(keyId) ||
    !ID.test(idempotencyKey) ||
    !NONCE.test(nonce)
  ) {
    return {
      ok: false,
      failure: provisioningFailure(
        "authentication_failed",
        "Provisioning authentication headers are invalid.",
      ),
    };
  }

  if (keyId !== input.principal.keyId) {
    return {
      ok: false,
      failure: provisioningFailure(
        "authentication_failed",
        "Provisioning authentication failed.",
      ),
    };
  }

  const timestampMs = Number(timestamp);
  if (
    !Number.isInteger(timestampMs) ||
    timestampMs <= 0 ||
    Math.abs(nowMs - timestampMs) > AUTH_WINDOW_MS
  ) {
    return {
      ok: false,
      failure: provisioningFailure(
        "authentication_failed",
        "Provisioning request timestamp is outside the accepted window.",
      ),
    };
  }

  const expected = signProvisioningRequest({
    secret: input.principal.secret,
    method,
    pathname,
    timestamp,
    nonce,
    idempotencyKey,
    body: input.body,
  });
  if (!safeSignatureEqual(expected, signature)) {
    return {
      ok: false,
      failure: provisioningFailure(
        "authentication_failed",
        "Provisioning authentication failed.",
      ),
    };
  }

  const nonceScope = input.principal.id + ":" + input.principal.keyId;
  const claimed = input.store.claimNonce(
    nonceScope,
    nonce,
    timestampMs + AUTH_WINDOW_MS,
    nowMs,
  );
  if (!claimed) {
    return {
      ok: false,
      failure: provisioningFailure(
        "replay_detected",
        "Provisioning request nonce has already been used.",
      ),
    };
  }

  return {
    ok: true,
    principal: input.principal,
    idempotencyKey,
  };
}

export function loadProvisioningPrincipalFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ProvisioningPrincipal | null {
  const id = env.PROVISIONING_GATEWAY_PRINCIPAL_ID?.trim() ?? "";
  const keyId = env.PROVISIONING_GATEWAY_KEY_ID?.trim() ?? "";
  const secret = env.PROVISIONING_GATEWAY_HMAC_SECRET ?? "";
  const tenantRefs = (env.PROVISIONING_GATEWAY_TENANT_REFS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!id || !keyId || !secret || tenantRefs.length === 0) return null;
  if (!ID.test(id) || !ID.test(keyId) || secret.length < 32) return null;
  if (tenantRefs.some((item) => !ID.test(item))) return null;

  return {
    id,
    keyId,
    secret,
    tenantRefs: [...new Set(tenantRefs)],
  };
}
