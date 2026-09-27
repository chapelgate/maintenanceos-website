import assert from "node:assert/strict";
import test from "node:test";
import {
  loadConnectorRegistryFromEnv,
  loadTtncSecretRegistryFromEnv,
  MemoryConnectorRegistry,
} from "./registry.ts";

test("server registry loads TTNC plus provider-neutral external connectors", () => {
  const registry = loadConnectorRegistryFromEnv({
    AGENT_CONNECTOR_REGISTRY_JSON: JSON.stringify([
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
        provider: "hubspot-managed",
        configured: true,
      },
    ]),
  });
  assert.equal(registry.get("phone-main")?.provider, "ttnc");
  assert.equal(registry.get("calendar-main")?.provider, "google-calendar-v2");
  assert.equal(registry.get("email-main")?.kind, "email");
  assert.equal(registry.get("crm-main")?.kind, "crm");
});

test("same connector ref can swap external provider without changing blueprint-facing ref", () => {
  const first = new MemoryConnectorRegistry([
    {
      ref: "calendar-main",
      kind: "calendar",
      provider: "google-calendar-v2",
      configured: true,
    },
  ]);
  const second = new MemoryConnectorRegistry([
    {
      ref: "calendar-main",
      kind: "calendar",
      provider: "microsoft-graph-v1",
      configured: true,
    },
  ]);
  assert.equal(first.get("calendar-main")?.ref, second.get("calendar-main")?.ref);
  assert.notEqual(
    first.get("calendar-main")?.provider,
    second.get("calendar-main")?.provider,
  );
});

test("registry fails closed on malformed, duplicate or secret-shaped configuration", () => {
  assert.throws(
    () =>
      loadConnectorRegistryFromEnv({
        AGENT_CONNECTOR_REGISTRY_JSON: JSON.stringify([
          {
            ref: "phone-main",
            kind: "telephony",
            provider: "ttnc",
            configured: true,
            existingNumber: "not-a-number",
            callApplicationId: 1,
            webhookUrl: "https://example.com/hook",
          },
        ]),
      }),
    /invalid connector/,
  );

  assert.throws(
    () =>
      new MemoryConnectorRegistry([
        {
          ref: "calendar-main",
          kind: "calendar",
          provider: "provider-one",
          configured: true,
        },
        {
          ref: "calendar-main",
          kind: "calendar",
          provider: "provider-two",
          configured: true,
        },
      ]),
    /Duplicate connector ref/,
  );
});

test("TTNC webhook secrets live in a separate server-only registry", () => {
  const secrets = loadTtncSecretRegistryFromEnv({
    TTNC_WEBHOOK_SECRETS_JSON: JSON.stringify({
      "phone-main": "0123456789abcdef0123456789abcdef",
    }),
  });
  assert.equal(
    secrets.getWebhookSecret("phone-main"),
    "0123456789abcdef0123456789abcdef",
  );
  assert.equal(secrets.getWebhookSecret("unknown"), undefined);
});
