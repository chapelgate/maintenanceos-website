import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { provisionAgent } from "./engine.ts";
import { FileProvisioningStore } from "./store.ts";
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


test("version-1 Step 8 state migrates without losing provisioning records", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mos-provisioning-"));
  const file = path.join(dir, "state.json");
  try {
    const seedStore = new FileProvisioningStore(file);
    const request = await validProvisioningEnvelope();
    const created = provisionAgent({
      request,
      principal: PRINCIPAL,
      idempotencyKey: "idem_store_migration",
      store: seedStore,
      now: () => new Date("2026-09-27T19:40:00.000Z"),
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const current = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
      string,
      unknown
    >;
    const legacy = {
      version: 1,
      nonces: current.nonces,
      idempotency: current.idempotency,
      provisionings: current.provisionings,
    };
    fs.writeFileSync(file, JSON.stringify(legacy), "utf8");

    const migrated = new FileProvisioningStore(file);
    assert.ok(migrated.getProvisioning(created.data.provisioningId));
    assert.equal(
      migrated.getAdapterPreparation(created.data.provisioningId),
      undefined,
    );
    assert.equal(
      migrated.claimNonce(
        "migration:scope",
        "nonce_migration_12345",
        3000,
        2000,
      ),
      true,
    );
    const persisted = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
      string,
      unknown
    >;
    assert.equal(persisted.version, 2);
    assert.deepEqual(persisted.adapterIdempotency, {});
    assert.deepEqual(persisted.adapterPreparations, {});
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
