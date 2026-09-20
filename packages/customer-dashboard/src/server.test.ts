import assert from "node:assert/strict";
import test from "node:test";
import { createDashboardServer, resetRateLimitForTests } from "./server.ts";
import { createDashboardStore } from "./store.ts";

function listen(server: ReturnType<typeof createDashboardServer>): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") throw new Error("no port");
      resolve(addr.port);
    });
  });
}

async function withServer(
  options: Parameters<typeof createDashboardServer>[0],
  fn: (base: string) => Promise<void>,
): Promise<void> {
  resetRateLimitForTests();
  const server = createDashboardServer(options);
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
  await withServer({ dashboardEnabled: false }, async (base) => {
    const res = await fetch(`${base}/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.dashboardEnabled, false);
    assert.equal(json.telephony, false);
  });
});

test("GET sessions is disabled when CUSTOMER_DASHBOARD_ENABLED is off", async () => {
  await withServer({ dashboardEnabled: false }, async (base) => {
    const res = await fetch(`${base}/v1/dashboard/sessions`, {
      headers: { Origin: "http://localhost:3000" },
    });
    const json = await res.json();
    assert.equal(res.status, 503);
    assert.equal(json.ok, false);
    assert.equal(json.error, "dashboard_disabled");
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
  });
});

test("GET sessions/bookings/detail serve labelled SAMPLE rows when enabled", async () => {
  const store = createDashboardStore("demo");
  await withServer({ dashboardEnabled: true, store }, async (base) => {
    const listRes = await fetch(`${base}/v1/dashboard/sessions`);
    const list = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.equal(list.ok, true);
    assert.equal(list.data.kind, "demo");
    assert.ok(list.data.sessions.length > 0);
    assert.match(list.data.sessions[0].summary, /SAMPLE/);

    const detailRes = await fetch(`${base}/v1/dashboard/sessions/demo_session_1`);
    const detail = await detailRes.json();
    assert.equal(detailRes.status, 200);
    assert.equal(detail.ok, true);
    assert.equal(detail.data.transcript.sampleLabel, "SAMPLE");

    const missingRes = await fetch(`${base}/v1/dashboard/sessions/nope`);
    const missing = await missingRes.json();
    assert.equal(missingRes.status, 404);
    assert.equal(missing.error, "session_not_found");

    const bookingsRes = await fetch(`${base}/v1/dashboard/bookings`);
    const bookings = await bookingsRes.json();
    assert.equal(bookingsRes.status, 200);
    assert.match(bookings.data.bookings[0].title, /SAMPLE/);
  });
});

test("empty store returns empty arrays without inventing rows", async () => {
  const store = createDashboardStore("empty");
  await withServer({ dashboardEnabled: true, store }, async (base) => {
    const list = await (await fetch(`${base}/v1/dashboard/sessions`)).json();
    assert.deepEqual(list.data.sessions, []);
    const bookings = await (await fetch(`${base}/v1/dashboard/bookings`)).json();
    assert.deepEqual(bookings.data.bookings, []);
  });
});
