import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { provisionAgent } from "./engine.ts";
import { FileProvisioningStore } from "./store.ts";
import { ADAPTER_READINESS_VERSION } from "./adapters/types.ts";
import { validProvisioningEnvelope } from "./test-fixture.ts";

const PRINCIPAL = {
  id: "provisioner_main",
  keyId: "key_main",
  secret: "0123456789abcdef0123456789abcdef",
  tenantRefs: ["tenant_acme"],
};

test("file store persists idempotency and provisioning records across restart", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mos-provisioning-"));
  const file = path.join(dir, "state.json");
  try {
    const firstStore = new FileProvisioningStore(file);
    const request = await validProvisioningEnvelope();
    const created = provisionAgent({
      request,
      principal: PRINCIPAL,
      idempotencyKey: "idem_store_0001",
      store: firstStore,
      now: () => new Date("2026-09-27T18:40:00.000Z"),
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const provisioning = firstStore.getProvisioning(created.data.provisioningId);
    assert.ok(provisioning);
    const readyBlueprint = structuredClone(provisioning.blueprint);
    readyBlueprint.lifecycle = { stage: "ready" };
    firstStore.putAdapterReadiness({
      version: ADAPTER_READINESS_VERSION,
      provisioningId: provisioning.id,
      tenantRef: provisioning.tenantRef,
      createdAt: "2026-09-27T19:40:00.000Z",
      complete: true,
      bindingsHash: "a".repeat(64),
      bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
      checks: [{
        id: "twilio_routes_match",
        kind: "telephony",
        connectorRef: "twilio_primary",
        ok: true,
        detail: "ready",
      }],
      failedCheckIds: [],
      blueprint: readyBlueprint,
    });

    const secondStore = new FileProvisioningStore(file);
    const replay = provisionAgent({
      request,
      principal: PRINCIPAL,
      idempotencyKey: "idem_store_0001",
      store: secondStore,
    });
    assert.equal(replay.ok, true);
    if (!replay.ok) return;
    assert.equal(replay.data.replayed, true);
    assert.equal(replay.data.provisioningId, created.data.provisioningId);
    assert.ok(secondStore.getProvisioning(created.data.provisioningId));
    const restoredReadiness = secondStore.getAdapterReadiness(
      created.data.provisioningId,
    );
    assert.ok(restoredReadiness);
    assert.equal(restoredReadiness.blueprint.lifecycle.stage, "ready");
    assert.equal(restoredReadiness.bindings[0].connectorRef, "twilio_primary");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("file store persists replay nonces and fails closed on corrupt state", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mos-provisioning-"));
  const file = path.join(dir, "state.json");
  try {
    const first = new FileProvisioningStore(file);
    assert.equal(
      first.claimNonce("principal:key", "nonce_1234567890abcd", 2000, 1000),
      true,
    );
    const second = new FileProvisioningStore(file);
    assert.equal(
      second.claimNonce("principal:key", "nonce_1234567890abcd", 2000, 1001),
      false,
    );

    fs.writeFileSync(file, '{"version":1,"nonces":[]}', "utf8");
    assert.throws(
      () => new FileProvisioningStore(file),
      /state file is invalid/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
