import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ADAPTER_DIR = path.join(ROOT, "packages", "provisioning-gateway", "src", "adapters");

test("provisioning-gateway adapter hardening: twilio fails closed on voice_application_sid present", async () => {
  const { probeTwilioConnector } = await import(path.join(ADAPTER_DIR, "twilio.ts"));
  const connector = {
    ref: "twilio_primary",
    provider: "twilio",
    kinds: new Set(["telephony", "sms"]),
    accountSid: "AC" + "a".repeat(32),
    incomingPhoneNumberSid: "PN" + "b".repeat(32),
    publicBaseUrl: "https://voice.example.com/",
    apiKeyEnv: "TWILIO_API_KEY",
    apiSecretEnv: "TWILIO_API_SECRET",
  };
  const env = {
    TWILIO_API_KEY: "SK" + "c".repeat(32),
    TWILIO_API_SECRET: "server-secret-value",
  };
  const result = await probeTwilioConnector({
    connector,
    kinds: new Set(["telephony"]),
    env,
    mutationsEnabled: false,
    transport: async () => ({ status: 200, body: JSON.stringify({ voice_application_sid: "AP" + "d".repeat(32) }) }),
  });
  assert.equal(result.ok, false);
});

test("provisioning-gateway adapter hardening: twilio fails closed on trunk_sid present", async () => {
  const { probeTwilioConnector } = await import(path.join(ADAPTER_DIR, "twilio.ts"));
  const connector = {
    ref: "twilio_primary",
    provider: "twilio",
    kinds: new Set(["telephony", "sms"]),
    accountSid: "AC" + "a".repeat(32),
    incomingPhoneNumberSid: "PN" + "b".repeat(32),
    publicBaseUrl: "https://voice.example.com/",
    apiKeyEnv: "TWILIO_API_KEY",
    apiSecretEnv: "TWILIO_API_SECRET",
  };
  const env = {
    TWILIO_API_KEY: "SK" + "c".repeat(32),
    TWILIO_API_SECRET: "server-secret-value",
  };
  const result = await probeTwilioConnector({
    connector,
    kinds: new Set(["telephony"]),
    env,
    mutationsEnabled: false,
    transport: async () => ({ status: 200, body: JSON.stringify({ trunk_sid: "TK" + "e".repeat(32) }) }),
  });
  assert.equal(result.ok, false);
});

test("provisioning-gateway adapter hardening: signed_https requires secret and fails closed when missing", async () => {
  const { probeSignedHttpsConnector } = await import(path.join(ADAPTER_DIR, "external.ts"));
  const connector = {
    ref: "crm_primary",
    provider: "signed_https",
    kinds: ["crm"],
    endpoint: "https://crm.example.com/base/",
    secretEnv: "CRM_CONNECTOR_SECRET",
  };
  const result = await probeSignedHttpsConnector({
    connector,
    kind: "crm",
    env: {},
    transport: async () => ({ status: 200, body: "" }),
  });
  assert.equal(result.ok, false);
});

test("provisioning-gateway adapter hardening: calendar provider rejects mock provider", async () => {
  const { probeCalendarConnector } = await import(path.join(ADAPTER_DIR, "external.ts"));
  const connector = {
    ref: "calendar_primary",
    provider: "calendar_companion",
    kinds: ["calendar"],
    endpoint: "https://calendar.example.com/",
  };
  const result = await probeCalendarConnector({
    connector,
    transport: async () => ({ status: 200, body: JSON.stringify({ ok: true, adaptersEnabled: true, provider: "mock" }) }),
  });
  assert.equal(result.ok, false);
});

test("provisioning-gateway adapter hardening: engine exports provisioning functions", async () => {
  const engine = await import(path.join(ROOT, "packages", "provisioning-gateway", "src", "engine.ts"));
  assert.ok("stableProvisioningJson" in engine);
  assert.ok("validateProvisioningRequest" in engine);
  assert.ok("provisionAgent" in engine);
});