import assert from "node:assert/strict";
import test from "node:test";
import { provisionAgent, validateProvisioningRequest } from "./engine.ts";
import { MemoryProvisioningStore } from "./store.ts";
import { validProvisioningEnvelope } from "./test-fixture.ts";

const PRINCIPAL = {
  id: "provisioner_main",
  keyId: "key_main",
  secret: "0123456789abcdef0123456789abcdef",
  tenantRefs: ["tenant_acme"],
};

test("canonical Step-7 evidence advances lifecycle only to provisioning", async () => {
  const request = await validProvisioningEnvelope();
  const original = structuredClone(request.blueprint);
  const store = new MemoryProvisioningStore();
  const result = provisionAgent({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_engine_0001",
    store,
    now: () => new Date("2026-09-27T18:30:00.000Z"),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.status, "provisioning");
  assert.equal(result.data.blueprintStage, "provisioning");
  assert.equal(result.data.replayed, false);

  const stored = store.getProvisioning(result.data.provisioningId);
  assert.ok(stored);
  assert.equal(stored.blueprint.lifecycle.stage, "provisioning");
  assert.deepEqual(
    { ...stored.blueprint, lifecycle: { stage: "sandbox_passed" } },
    original,
  );
});

test("gateway recomputes Step-7 evidence and rejects blueprint tampering", async () => {
  const request = await validProvisioningEnvelope();
  const tampered = structuredClone(request) as Record<string, any>;
  tampered.blueprint.agent.greeting = "Tampered after qualification";
  const parsed = validateProvisioningRequest(tampered);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.equal(parsed.result.error, "qualification_required");
});

test("gateway rejects transcript/evidence tampering", async () => {
  const request = await validProvisioningEnvelope();
  const tampered = structuredClone(request) as Record<string, any>;
  tampered.evidence.test.turns[0].text = "Different transcript";
  const parsed = validateProvisioningRequest(tampered);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.equal(parsed.result.error, "qualification_required");
});

test("only sandbox_passed blueprints can enter provisioning", async () => {
  const request = await validProvisioningEnvelope();
  const wrong = structuredClone(request) as Record<string, any>;
  wrong.blueprint.lifecycle.stage = "reviewed";
  const parsed = validateProvisioningRequest(wrong);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.equal(parsed.result.error, "invalid_blueprint");
});

test("tenant scope fails closed before a provisioning record is created", async () => {
  const request = await validProvisioningEnvelope({ tenantRef: "tenant_other" });
  const store = new MemoryProvisioningStore();
  const result = provisionAgent({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_engine_0002",
    store,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "tenant_forbidden");
});

test("idempotent retry returns one provisioning id; changed content conflicts", async () => {
  const request = await validProvisioningEnvelope();
  const store = new MemoryProvisioningStore();
  const first = provisionAgent({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_engine_0003",
    store,
    now: () => new Date("2026-09-27T18:31:00.000Z"),
  });
  assert.equal(first.ok, true);
  const second = provisionAgent({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_engine_0003",
    store,
    now: () => new Date("2026-09-27T18:32:00.000Z"),
  });
  assert.equal(second.ok, true);
  if (first.ok && second.ok) {
    assert.equal(second.data.provisioningId, first.data.provisioningId);
    assert.equal(second.data.replayed, true);
    assert.equal(second.data.createdAt, first.data.createdAt);
  }

  const changed = await validProvisioningEnvelope({
    greeting: "Different but valid reviewed greeting",
    blueprintId: "abp_step8test0002",
  });
  const conflict = provisionAgent({
    request: changed,
    principal: PRINCIPAL,
    idempotencyKey: "idem_engine_0003",
    store,
  });
  assert.equal(conflict.ok, false);
  if (!conflict.ok) assert.equal(conflict.error, "idempotency_conflict");
});

test("forged qualification summary without canonical evidence is rejected", async () => {
  const request = await validProvisioningEnvelope();
  const forged = structuredClone(request) as Record<string, any>;
  forged.qualification.testId = "sandbox_test_forged";
  const parsed = validateProvisioningRequest(forged);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.equal(parsed.result.error, "qualification_required");
});
