import assert from "node:assert/strict";
import test from "node:test";
import { parseAdapterRegistry } from "./registry.ts";

const AC = "AC" + "a".repeat(32);
const PN = "PN" + "b".repeat(32);

test("registry accepts server-only Twilio, calendar and signed HTTPS connectors", () => {
  const registry = parseAdapterRegistry({
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
      {
        ref: "crm_primary",
        provider: "signed_https",
        kinds: ["crm"],
        endpoint: "https://crm.example.com/",
        secretEnv: "CRM_CONNECTOR_SECRET",
      },
    ],
  });
  assert.equal(registry.connectors.length, 3);
});

test("registry rejects TTNC, insecure URLs, duplicate refs and raw secret fields", () => {
  assert.throws(
    () =>
      parseAdapterRegistry({
        connectors: [
          {
            ref: "legacy",
            provider: "ttnc",
            kinds: ["telephony"],
          },
        ],
      }),
    /invalid/i,
  );
  assert.throws(
    () =>
      parseAdapterRegistry({
        connectors: [{
          ref: "twilio_primary",
          provider: "twilio",
          kinds: ["telephony"],
          accountSid: AC,
          incomingPhoneNumberSid: PN,
          publicBaseUrl: "http://voice.example.com/",
          apiKeyEnv: "TWILIO_API_KEY",
          apiSecretEnv: "TWILIO_API_SECRET",
        }],
      }),
    /invalid/i,
  );
  const connector = {
    ref: "calendar_primary",
    provider: "calendar_companion",
    kinds: ["calendar"],
    endpoint: "https://calendar.example.com/",
  };
  assert.throws(
    () => parseAdapterRegistry({ connectors: [connector, connector] }),
    /unique/i,
  );
  assert.throws(
    () =>
      parseAdapterRegistry({
        connectors: [{
          ref: "crm_primary",
          provider: "signed_https",
          kinds: ["crm"],
          endpoint: "https://crm.example.com/",
          secretEnv: "CRM_CONNECTOR_SECRET",
          secret: "must-never-live-here",
        }],
      }),
    /invalid/i,
  );
});
