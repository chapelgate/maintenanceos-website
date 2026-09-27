import assert from "node:assert/strict";
import test from "node:test";
import { prepareAgentAdapters } from "./engine.ts";
import {
  MemoryConnectorRegistry,
  MemoryTtncSecretRegistry,
} from "./registry.ts";
import { provisioningBlueprint } from "./test-fixture.ts";

const SECRET = "0123456789abcdef0123456789abcdef";

function registry(calendarProvider = "google-calendar-v2") {
  return new MemoryConnectorRegistry([
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
      provider: calendarProvider,
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
}

test("TTNC existing-number plus external connectors prepare one ready blueprint", async () => {
  const before = await provisioningBlueprint();
  const result = prepareAgentAdapters({
    blueprint: before,
    connectorRefs: [
      "phone-main",
      "calendar-main",
      "email-main",
      "crm-main",
    ],
    registry: registry(),
    ttncSecrets: new MemoryTtncSecretRegistry({
      "phone-main": SECRET,
    }),
  });
  assert.equal(result.blueprint.lifecycle.stage, "ready");
  assert.equal(result.activationRequired, true);
  assert.deepEqual(
    result.blueprint.integrations.map((item) => item.kind),
    ["telephony", "calendar", "email", "crm"],
  );
  assert.equal(result.bindings[0]?.telephony?.mutationPerformed, false);
  assert.equal(
    result.bindings[0]?.telephony?.webhookVerification,
    "hmac-sha256-raw-body",
  );

  const normalizedBefore = structuredClone(before);
  const normalizedAfter = structuredClone(result.blueprint);
  normalizedBefore.integrations = [];
  normalizedAfter.integrations = [];
  normalizedBefore.lifecycle = { stage: "provisioning" };
  normalizedAfter.lifecycle = { stage: "provisioning" };
  assert.deepEqual(normalizedAfter, normalizedBefore);
});

test("provider swap changes adapter metadata but not the ready AgentBlueprint", async () => {
  const blueprint = await provisioningBlueprint();
  const secrets = new MemoryTtncSecretRegistry({
    "phone-main": SECRET,
  });
  const google = prepareAgentAdapters({
    blueprint,
    connectorRefs: ["calendar-main"],
    registry: registry("google-calendar-v2"),
    ttncSecrets: secrets,
  });
  const microsoft = prepareAgentAdapters({
    blueprint,
    connectorRefs: ["calendar-main"],
    registry: registry("microsoft-graph-v1"),
    ttncSecrets: secrets,
  });
  assert.deepEqual(google.blueprint, microsoft.blueprint);
  assert.notEqual(
    google.bindings[0]?.provider,
    microsoft.bindings[0]?.provider,
  );
});

test("unknown connector, duplicate kind and missing TTNC secret fail closed", async () => {
  const blueprint = await provisioningBlueprint();
  assert.throws(
    () =>
      prepareAgentAdapters({
        blueprint,
        connectorRefs: ["missing"],
        registry: registry(),
        ttncSecrets: new MemoryTtncSecretRegistry({}),
      }),
    /not configured/,
  );

  const duplicateKind = new MemoryConnectorRegistry([
    {
      ref: "calendar-a",
      kind: "calendar",
      provider: "provider-a",
      configured: true,
    },
    {
      ref: "calendar-b",
      kind: "calendar",
      provider: "provider-b",
      configured: true,
    },
  ]);
  assert.throws(
    () =>
      prepareAgentAdapters({
        blueprint,
        connectorRefs: ["calendar-a", "calendar-b"],
        registry: duplicateKind,
        ttncSecrets: new MemoryTtncSecretRegistry({}),
      }),
    /one connector per integration kind/,
  );

  assert.throws(
    () =>
      prepareAgentAdapters({
        blueprint,
        connectorRefs: ["phone-main"],
        registry: registry(),
        ttncSecrets: new MemoryTtncSecretRegistry({}),
      }),
    /TTNC webhook secret/,
  );
});

test("only provisioning lifecycle may prepare adapters", async () => {
  const blueprint = await provisioningBlueprint();
  const wrong = structuredClone(blueprint);
  wrong.lifecycle = { stage: "ready" };
  assert.throws(
    () =>
      prepareAgentAdapters({
        blueprint: wrong,
        connectorRefs: ["calendar-main"],
        registry: registry(),
        ttncSecrets: new MemoryTtncSecretRegistry({}),
      }),
    /Only a provisioning AgentBlueprint/,
  );
});
