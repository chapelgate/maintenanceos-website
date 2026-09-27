import assert from "node:assert/strict";
import test from "node:test";
import {
  MemoryConnectorRegistry,
  MemoryTtncSecretRegistry,
} from "../../agent-adapters/src/registry.ts";
import { prepareProvisioningAdapters } from "./adapters.ts";
import { provisionAgent } from "./engine.ts";
import { MemoryProvisioningStore } from "./store.ts";
import { validProvisioningEnvelope } from "./test-fixture.ts";

const PRINCIPAL = {
  id: "provisioner_main",
  keyId: "key_main",
  secret: "0123456789abcdef0123456789abcdef",
  tenantRefs: ["tenant_acme"],
};

const registry = new MemoryConnectorRegistry([
  {
    ref: "phone-main",
    kind: "telephony",
    provider: "ttnc",
    configured: true,
    existingNumber: "02922716489",
    callApplicationId: 999,
    webhookUrl:
      "https://agent.example/v1/telephony/ttnc/phone-main/webhook",
  },
  {
    ref: "calendar-main",
    kind: "calendar",
    provider: "google-calendar-v2",
    configured: true,
  },
  {
    ref: "email-main",
    kind: "email",
    provider: "resend-managed",
    configured: true,
  },
  {
    ref: "crm-main",
    kind: "crm",
    provider: "crm-managed",
    configured: true,
  },
]);

const secrets = new MemoryTtncSecretRegistry({
  "phone-main": "0123456789abcdef0123456789abcdef",
});

async function provision(store: MemoryProvisioningStore) {
  const envelope = await validProvisioningEnvelope();
  const result = provisionAgent({
    request: envelope,
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_provision",
    store,
    now: () => new Date("2026-09-27T19:30:00.000Z"),
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("fixture provisioning failed");
  return result.data.provisioningId;
}

test("authenticated provisioning record prepares adapters and persists ready state", async () => {
  const store = new MemoryProvisioningStore();
  const provisioningId = await provision(store);
  const before = store.getProvisioning(provisioningId);
  assert.ok(before);

  const result = prepareProvisioningAdapters({
    request: {
      provisioningId,
      connectorRefs: [
        "phone-main",
        "calendar-main",
        "email-main",
        "crm-main",
      ],
    },
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_adapters",
    store,
    registry,
    ttncSecrets: secrets,
    now: () => new Date("2026-09-27T19:31:00.000Z"),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.status, "ready");
  assert.equal(result.data.blueprintStage, "ready");
  assert.equal(result.data.activationRequired, true);
  assert.equal(result.data.replayed, false);
  assert.deepEqual(
    result.data.connectors.map((item) => item.kind),
    ["telephony", "calendar", "email", "crm"],
  );

  const stored = store.getAdapterPreparation(provisioningId);
  assert.ok(stored);
  assert.equal(stored.status, "ready");
  assert.equal(stored.preparation.blueprint.lifecycle.stage, "ready");
  assert.equal(
    stored.preparation.bindings[0]?.telephony?.mutationPerformed,
    false,
  );
  assert.deepEqual(
    {
      ...stored.preparation.blueprint,
      integrations: [],
      lifecycle: { stage: "provisioning" },
    },
    {
      ...before.blueprint,
      integrations: [],
      lifecycle: { stage: "provisioning" },
    },
  );
});

test("adapter preparation retry is idempotent and changed content conflicts", async () => {
  const store = new MemoryProvisioningStore();
  const provisioningId = await provision(store);
  const request = {
    provisioningId,
    connectorRefs: ["phone-main", "calendar-main"],
  };

  const first = prepareProvisioningAdapters({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_retry",
    store,
    registry,
    ttncSecrets: secrets,
  });
  const second = prepareProvisioningAdapters({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_retry",
    store,
    registry,
    ttncSecrets: secrets,
  });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (first.ok && second.ok) {
    assert.equal(second.data.replayed, true);
    assert.equal(second.data.provisioningId, first.data.provisioningId);
  }

  const conflict = prepareProvisioningAdapters({
    request: {
      provisioningId,
      connectorRefs: ["phone-main", "email-main"],
    },
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_retry",
    store,
    registry,
    ttncSecrets: secrets,
  });
  assert.equal(conflict.ok, false);
  if (!conflict.ok) assert.equal(conflict.error, "idempotency_conflict");
});

test("unknown provisioning, wrong principal and missing connector fail closed", async () => {
  const store = new MemoryProvisioningStore();
  const missing = prepareProvisioningAdapters({
    request: {
      provisioningId: "prv_0123456789abcdef01234567",
      connectorRefs: ["calendar-main"],
    },
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_missing",
    store,
    registry,
    ttncSecrets: secrets,
  });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error, "provisioning_not_found");

  const provisioningId = await provision(store);
  const wrongPrincipal = {
    ...PRINCIPAL,
    id: "provisioner_other",
  };
  const forbidden = prepareProvisioningAdapters({
    request: { provisioningId, connectorRefs: ["calendar-main"] },
    principal: wrongPrincipal,
    idempotencyKey: "idem_step9_forbidden",
    store,
    registry,
    ttncSecrets: secrets,
  });
  assert.equal(forbidden.ok, false);
  if (!forbidden.ok) assert.equal(forbidden.error, "tenant_forbidden");

  const noConnector = prepareProvisioningAdapters({
    request: { provisioningId, connectorRefs: ["not-configured"] },
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_connector",
    store,
    registry,
    ttncSecrets: secrets,
  });
  assert.equal(noConnector.ok, false);
  if (!noConnector.ok) assert.equal(noConnector.error, "adapter_not_configured");
});
