import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateProvisioningRequest,
  loadProvisioningPrincipalFromEnv,
  signProvisioningRequest,
} from "./auth.ts";
import { MemoryProvisioningStore } from "./store.ts";

const NOW = 1_790_532_000_000;
const PRINCIPAL = {
  id: "provisioner_main",
  keyId: "key_main",
  secret: "0123456789abcdef0123456789abcdef",
  tenantRefs: ["tenant_acme"],
};

function headers(body: Buffer, nonce = "nonce_1234567890abcdef") {
  const timestamp = String(NOW);
  const idempotencyKey = "idem_1234567890";
  return {
    keyId: PRINCIPAL.keyId,
    timestamp,
    nonce,
    idempotencyKey,
    signature: signProvisioningRequest({
      secret: PRINCIPAL.secret,
      timestamp,
      nonce,
      idempotencyKey,
      body,
    }),
  };
}

test("valid HMAC request authenticates once", () => {
  const body = Buffer.from('{"ok":true}');
  const store = new MemoryProvisioningStore();
  const result = authenticateProvisioningRequest({
    principal: PRINCIPAL,
    headers: headers(body),
    body,
    store,
    nowMs: NOW,
  });
  assert.equal(result.ok, true);
});

test("same nonce is rejected as replay even with a valid signature", () => {
  const body = Buffer.from('{"ok":true}');
  const store = new MemoryProvisioningStore();
  const first = authenticateProvisioningRequest({
    principal: PRINCIPAL,
    headers: headers(body),
    body,
    store,
    nowMs: NOW,
  });
  assert.equal(first.ok, true);
  const second = authenticateProvisioningRequest({
    principal: PRINCIPAL,
    headers: headers(body),
    body,
    store,
    nowMs: NOW,
  });
  assert.equal(second.ok, false);
  if (!second.ok) assert.equal(second.failure.error, "replay_detected");
});

test("body tampering, stale timestamp and wrong key fail authentication", () => {
  const signedBody = Buffer.from('{"ok":true}');
  const changedBody = Buffer.from('{"ok":false}');
  const store = new MemoryProvisioningStore();

  const tampered = authenticateProvisioningRequest({
    principal: PRINCIPAL,
    headers: headers(signedBody, "nonce_tamper_12345678"),
    body: changedBody,
    store,
    nowMs: NOW,
  });
  assert.equal(tampered.ok, false);

  const staleTimestamp = String(NOW - 10 * 60 * 1000);
  const nonce = "nonce_stale_123456789";
  const idempotencyKey = "idem_stale_123456";
  const stale = authenticateProvisioningRequest({
    principal: PRINCIPAL,
    headers: {
      keyId: PRINCIPAL.keyId,
      timestamp: staleTimestamp,
      nonce,
      idempotencyKey,
      signature: signProvisioningRequest({
        secret: PRINCIPAL.secret,
        timestamp: staleTimestamp,
        nonce,
        idempotencyKey,
        body: signedBody,
      }),
    },
    body: signedBody,
    store,
    nowMs: NOW,
  });
  assert.equal(stale.ok, false);

  const wrongKey = authenticateProvisioningRequest({
    principal: PRINCIPAL,
    headers: { ...headers(signedBody, "nonce_wrongkey_123456"), keyId: "key_other" },
    body: signedBody,
    store,
    nowMs: NOW,
  });
  assert.equal(wrongKey.ok, false);
});

test("server-only principal env requires strong secret and tenant scope", () => {
  assert.equal(loadProvisioningPrincipalFromEnv({}), null);
  assert.equal(
    loadProvisioningPrincipalFromEnv({
      PROVISIONING_GATEWAY_PRINCIPAL_ID: "provisioner_main",
      PROVISIONING_GATEWAY_KEY_ID: "key_main",
      PROVISIONING_GATEWAY_HMAC_SECRET: "short",
      PROVISIONING_GATEWAY_TENANT_REFS: "tenant_acme",
    }),
    null,
  );
  const loaded = loadProvisioningPrincipalFromEnv({
    PROVISIONING_GATEWAY_PRINCIPAL_ID: "provisioner_main",
    PROVISIONING_GATEWAY_KEY_ID: "key_main",
    PROVISIONING_GATEWAY_HMAC_SECRET:
      "0123456789abcdef0123456789abcdef",
    PROVISIONING_GATEWAY_TENANT_REFS: "tenant_acme,tenant_beta,tenant_acme",
  });
  assert.ok(loaded);
  assert.deepEqual(loaded.tenantRefs, ["tenant_acme", "tenant_beta"]);
});
