import assert from "node:assert/strict";
import test from "node:test";
import { createSandboxEngine } from "./engine.ts";
import { createSandboxServer, resetRateLimitForTests } from "./server.ts";

function listen(server: ReturnType<typeof createSandboxServer>): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") throw new Error("no port");
      resolve(addr.port);
    });
  });
}

async function withServer(
  options: Parameters<typeof createSandboxServer>[0],
  fn: (base: string) => Promise<void>,
): Promise<void> {
  resetRateLimitForTests();
  const server = createSandboxServer(options);
  const port = await listen(server);
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

test("GET /health reports flag off and no telephony", async () => {
  await withServer({ sandboxEnabled: false }, async (base) => {
    const res = await fetch(`${base}/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.sandboxEnabled, false);
    assert.equal(json.telephony, false);
    assert.equal(json.liveCall, false);
    assert.equal(json.liveNumber, null);
    assert.equal(json.productionTelephony, false);
  });
});

test("POST session is disabled when SANDBOX_TEST_CALL_ENABLED is off", async () => {
  await withServer({ sandboxEnabled: false }, async (base) => {
    const res = await fetch(`${base}/v1/sandbox/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({ businessName: "Acme" }),
    });
    const json = await res.json();
    assert.equal(res.status, 503);
    assert.equal(json.ok, false);
    assert.equal(json.error, "sandbox_disabled");
    assert.equal(json.liveCall, false);
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
  });
});

test("POST session + scripted test-call when enabled", async () => {
  const engine = createSandboxEngine({ enabled: true });
  await withServer({ sandboxEnabled: true, engine }, async (base) => {
    const createRes = await fetch(`${base}/v1/sandbox/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: "Acme",
        greeting: "Hello from Acme",
        hours: "9-5",
        services: "Boilers",
        faqs: "Q: Emergency?\nA: Call the on-call number we already published.",
      }),
    });
    const created = await createRes.json();
    assert.equal(createRes.status, 200);
    assert.equal(created.ok, true);
    assert.equal(created.data.liveNumber, null);

    const getRes = await fetch(`${base}/v1/sandbox/sessions/${created.data.id}`);
    const described = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(described.data.draft.businessName, "Acme");

    const testRes = await fetch(
      `${base}/v1/sandbox/sessions/${created.data.id}/test-call`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "scripted" }),
      },
    );
    const tested = await testRes.json();
    assert.equal(testRes.status, 200);
    assert.equal(tested.ok, true);
    assert.equal(tested.data.status, "scripted_demo_complete");
    assert.equal(tested.data.liveCall, false);
    assert.equal(tested.liveCall, false);
  });
});

test("POST webrtc test-call returns not_configured, never a live success", async () => {
  const engine = createSandboxEngine({ enabled: true });
  await withServer({ sandboxEnabled: true, engine }, async (base) => {
    const createRes = await fetch(`${base}/v1/sandbox/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName: "Acme" }),
    });
    const created = await createRes.json();
    const testRes = await fetch(
      `${base}/v1/sandbox/sessions/${created.data.id}/test-call`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "webrtc" }),
      },
    );
    const tested = await testRes.json();
    assert.equal(testRes.status, 503);
    assert.equal(tested.ok, false);
    assert.equal(tested.error, "not_configured");
    assert.equal(tested.liveCall, false);
  });
});
