import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { probeCalendarConnector, probeSignedHttpsConnector } from "./external.ts";

test("calendar mock is rejected; configured Google provider passes", async () => {
  const connector = {
    ref: "calendar_primary",
    provider: "calendar_companion" as const,
    kinds: ["calendar"] as ["calendar"],
    endpoint: "https://calendar.example.com/",
  };
  const mock = await probeCalendarConnector({
    connector,
    transport: async () => ({
      status: 200,
      body: JSON.stringify({ ok: true, adaptersEnabled: true, provider: "mock" }),
    }),
  });
  assert.equal(mock.ok, false);

  const live = await probeCalendarConnector({
    connector,
    transport: async () => ({
      status: 200,
      body: JSON.stringify({
        ok: true,
        adaptersEnabled: true,
        provider: "google",
        googleOAuth: { clientConfigured: true, tokenPresent: true },
      }),
    }),
  });
  assert.equal(live.ok, true);
});

test("signed HTTPS readiness requires server secret and signs the health challenge", async () => {
  const connector = {
    ref: "crm_primary",
    provider: "signed_https" as const,
    kinds: ["crm"] as ["crm"],
    endpoint: "https://crm.example.com/base/",
    secretEnv: "CRM_CONNECTOR_SECRET",
  };
  let called = false;
  const missing = await probeSignedHttpsConnector({
    connector,
    kind: "crm",
    env: {},
    transport: async () => {
      called = true;
      return { status: 500, body: "" };
    },
  });
  assert.equal(missing.ok, false);
  assert.equal(called, false);

  const secret = "0123456789abcdef0123456789abcdef";
  const timestamp = 1234567890;
  const nonce = "nonce1234567890abcdef";
  const expected = createHmac("sha256", secret)
    .update(["GET", "/health", String(timestamp), nonce].join("\n"))
    .digest("hex");
  const ready = await probeSignedHttpsConnector({
    connector,
    kind: "crm",
    env: { CRM_CONNECTOR_SECRET: secret },
    nowMs: timestamp,
    nonce,
    transport: async (request) => {
      assert.equal(request.url, "https://crm.example.com/health");
      assert.equal(request.headers?.["X-MOS-Signature"], expected);
      return {
        status: 200,
        body: JSON.stringify({ ok: true, ready: true, kind: "crm" }),
      };
    },
  });
  assert.equal(ready.ok, true);
});
