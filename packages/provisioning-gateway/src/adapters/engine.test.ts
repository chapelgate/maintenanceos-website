import assert from "node:assert/strict";
import test from "node:test";
import { provisionAgent } from "../engine.ts";
import { MemoryProvisioningStore } from "../store.ts";
import { validProvisioningEnvelope } from "../test-fixture.ts";
import {
  prepareAdapterReadiness,
  readinessMatchesProvisioning,
} from "./engine.ts";
import type { AdapterRegistry, AdapterTransport } from "./types.ts";

const PRINCIPAL = {
  id: "provisioner_main",
  keyId: "key_main",
  secret: "0123456789abcdef0123456789abcdef",
  tenantRefs: ["tenant_acme"],
};
const AC = "AC" + "a".repeat(32);
const PN = "PN" + "b".repeat(32);
const ENV = {
  TWILIO_API_KEY: "SK" + "c".repeat(32),
  TWILIO_API_SECRET: "server-secret-value",
};

const registry: AdapterRegistry = {
  connectors: [
    {
      ref: "twilio_primary",
      provider: "twilio",
      kinds: ["telephony", "sms"],
      accountSid: AC,
      incomingPhoneNumberSid: PN,
      publicBaseUrl: "https://voice.example.com/",
      apiKeyEnv: "TWILIO_API_KEY",
      apiSecretEnv: "TWILIO_API_SECRET",
    },
    {
      ref: "calendar_primary",
      provider: "calendar_companion",
      kinds: ["calendar"],
      endpoint: "https://calendar.example.com/",
    },
  ],
};

function transport(): AdapterTransport {
  return async (request) => {
    if (request.url.includes("api.twilio.com")) {
      return {
        status: 200,
        body: JSON.stringify({
          voice_url: "https://voice.example.com/voice/inbound",
          voice_method: "POST",
          voice_application_sid: null,
          trunk_sid: null,
          sms_url: "",
          sms_method: "POST",
          sms_application_sid: null,
        }),
      };
    }
    if (request.url === "https://calendar.example.com/health") {
      return {
        status: 200,
        body: JSON.stringify({
          ok: true,
          adaptersEnabled: true,
          provider: "google",
          googleOAuth: { clientConfigured: true, tokenPresent: true },
        }),
      };
    }
    throw new Error("Unexpected test request: " + request.url);
  };
}

async function provisioning(agentType: "maintenance_desk" | "booking_assistant" = "maintenance_desk") {
  const store = new MemoryProvisioningStore();
  const request = await validProvisioningEnvelope({
    agentType,
    blueprintId:
      agentType === "booking_assistant"
        ? "abp_step9booking01"
        : "abp_step9maint0001",
  });
  const result = provisionAgent({
    request,
    principal: PRINCIPAL,
    idempotencyKey: "idem_step9_" + agentType,
    store,
    now: () => new Date("2026-09-27T19:15:00.000Z"),
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("fixture provisioning failed");
  const record = store.getProvisioning(result.data.provisioningId);
  assert.ok(record);
  return record;
}

test("reviewed telephony intent becomes ready with server-side Twilio binding", async () => {
  const record = await provisioning();
  assert.deepEqual(record.blueprint.integrations, [
    { kind: "telephony", enabled: true },
  ]);
  const result = await prepareAdapterReadiness({
    provisioning: record,
    principal: PRINCIPAL,
    bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
    registry,
    env: ENV,
    transport: transport(),
    now: () => new Date("2026-09-27T19:16:00.000Z"),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.record.blueprint.lifecycle.stage, "ready");
  assert.deepEqual(result.record.blueprint.integrations, record.blueprint.integrations);
  assert.deepEqual(result.record.bindings, [
    { kind: "telephony", connectorRef: "twilio_primary" },
  ]);
  assert.equal(readinessMatchesProvisioning(result.record, record), true);
});

test("booking assistant requires both reviewed telephony and calendar bindings", async () => {
  const record = await provisioning("booking_assistant");
  assert.deepEqual(record.blueprint.integrations, [
    { kind: "telephony", enabled: true },
    { kind: "calendar", enabled: true },
  ]);

  const missing = await prepareAdapterReadiness({
    provisioning: record,
    principal: PRINCIPAL,
    bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error, "invalid_bindings");

  const ready = await prepareAdapterReadiness({
    provisioning: record,
    principal: PRINCIPAL,
    bindings: [
      { kind: "telephony", connectorRef: "twilio_primary" },
      { kind: "calendar", connectorRef: "calendar_primary" },
    ],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(ready.ok, true);
});

test("extra unreviewed binding and wrong provider kind fail closed", async () => {
  const record = await provisioning();
  const extra = await prepareAdapterReadiness({
    provisioning: record,
    principal: PRINCIPAL,
    bindings: [
      { kind: "telephony", connectorRef: "twilio_primary" },
      { kind: "calendar", connectorRef: "calendar_primary" },
    ],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(extra.ok, false);
  if (!extra.ok) assert.equal(extra.error, "invalid_bindings");

  const mismatch = await prepareAdapterReadiness({
    provisioning: record,
    principal: PRINCIPAL,
    bindings: [{ kind: "telephony", connectorRef: "calendar_primary" }],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(mismatch.ok, false);
  if (!mismatch.ok) assert.equal(mismatch.error, "connector_kind_mismatch");
});

test("cross-tenant principal and non-provisioning lifecycle fail closed", async () => {
  const record = await provisioning();
  const tenant = await prepareAdapterReadiness({
    provisioning: record,
    principal: { ...PRINCIPAL, tenantRefs: ["tenant_other"] },
    bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(tenant.ok, false);
  if (!tenant.ok) assert.equal(tenant.error, "tenant_forbidden");

  const wrongStage = structuredClone(record);
  wrongStage.blueprint.lifecycle.stage = "ready";
  const lifecycle = await prepareAdapterReadiness({
    provisioning: wrongStage,
    principal: PRINCIPAL,
    bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(lifecycle.ok, false);
  if (!lifecycle.ok) assert.equal(lifecycle.error, "invalid_provisioning");
});

test("connector refs remain outside the reviewed blueprint", async () => {
  const record = await provisioning();
  const result = await prepareAdapterReadiness({
    provisioning: record,
    principal: PRINCIPAL,
    bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
    registry,
    env: ENV,
    transport: transport(),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.record.blueprint.integrations[0].connectorRef, undefined);
  assert.equal(result.record.bindings[0].connectorRef, "twilio_primary");
});
