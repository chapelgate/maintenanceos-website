import assert from "node:assert/strict";
import test from "node:test";
import { createMockCalendarAdapter } from "./mock.ts";
import {
  createCalendarServer,
  resetRateLimitForTests,
  resolveListenHost,
  resolveListenPort,
  DEFAULT_HOST,
  DEFAULT_PORT,
} from "./server.ts";

function listen(server: ReturnType<typeof createCalendarServer>): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") throw new Error("no port");
      resolve(addr.port);
    });
  });
}

async function withServer(
  options: Parameters<typeof createCalendarServer>[0],
  fn: (base: string) => Promise<void>,
): Promise<void> {
  resetRateLimitForTests();
  const server = createCalendarServer(options);
  const port = await listen(server);
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

test("resolveListenHost stays loopback unless CALENDAR_ADAPTERS_HOST is set", () => {
  assert.equal(resolveListenHost({}), DEFAULT_HOST);
  assert.equal(resolveListenHost({ CALENDAR_ADAPTERS_HOST: "0.0.0.0" }), "0.0.0.0");
  assert.equal(resolveListenHost({ CALENDAR_ADAPTERS_HOST: "  " }), DEFAULT_HOST);
});

test("resolveListenPort prefers CALENDAR_ADAPTERS_PORT then PORT", () => {
  assert.equal(resolveListenPort({}), DEFAULT_PORT);
  assert.equal(resolveListenPort({ CALENDAR_ADAPTERS_PORT: "8789" }), 8789);
  assert.equal(resolveListenPort({ PORT: "10000" }), 10000);
  assert.equal(
    resolveListenPort({ CALENDAR_ADAPTERS_PORT: "8789", PORT: "10000" }),
    8789,
  );
  assert.equal(resolveListenPort({ PORT: "not-a-port" }), DEFAULT_PORT);
  assert.equal(resolveListenPort({ CALENDAR_ADAPTERS_PORT: "-1" }), DEFAULT_PORT);
});

test("GET /health reports flag off and no telephony", async () => {
  await withServer({ adaptersEnabled: false }, async (base) => {
    const res = await fetch(`${base}/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.adaptersEnabled, false);
    assert.equal(json.telephony, false);
  });
});

test("POST slots is disabled when CALENDAR_ADAPTERS_ENABLED is off", async () => {
  await withServer({ adaptersEnabled: false }, async (base) => {
    const res = await fetch(`${base}/v1/calendar/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({
        from: "2026-09-21T00:00:00.000Z",
        to: "2026-09-22T00:00:00.000Z",
      }),
    });
    const json = await res.json();
    assert.equal(res.status, 503);
    assert.equal(json.ok, false);
    assert.equal(json.error, "calendar_disabled");
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
  });
});

test("POST slots/bookings use the mock adapter when enabled", async () => {
  const adapter = createMockCalendarAdapter({
    now: () => new Date("2026-09-21T08:00:00.000Z"),
  });
  await withServer({ adaptersEnabled: true, adapter }, async (base) => {
    const slotsRes = await fetch(`${base}/v1/calendar/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "2026-09-21T00:00:00.000Z",
        to: "2026-09-22T00:00:00.000Z",
        timezone: "Europe/London",
      }),
    });
    const slots = await slotsRes.json();
    assert.equal(slotsRes.status, 200);
    assert.equal(slots.ok, true);
    assert.ok(slots.data.length > 0);

    const bookRes = await fetch(`${base}/v1/calendar/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: slots.data[0].start,
        end: slots.data[0].end,
        timezone: "Europe/London",
        title: "Server test",
      }),
    });
    const booked = await bookRes.json();
    assert.equal(bookRes.status, 200);
    assert.equal(booked.ok, true);
    assert.equal(booked.data.provider, "mock");

    const again = await fetch(`${base}/v1/calendar/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: slots.data[0].start,
        end: slots.data[0].end,
        timezone: "Europe/London",
      }),
    });
    const conflict = await again.json();
    assert.equal(again.status, 409);
    assert.equal(conflict.ok, false);
    assert.equal(conflict.error, "slot_unavailable");
  });
});

test("listen-shaped server keeps mock bookings across list + book + conflict", async () => {
  await withServer({ adaptersEnabled: true }, async (base) => {
    const slotsRes = await fetch(`${base}/v1/calendar/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "2026-09-28T00:00:00.000Z",
        to: "2026-09-29T00:00:00.000Z",
        timezone: "Europe/London",
      }),
    });
    const slots = await slotsRes.json();
    assert.equal(slotsRes.status, 200);
    assert.ok(slots.data.length > 0);

    const bookRes = await fetch(`${base}/v1/calendar/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: slots.data[0].start,
        end: slots.data[0].end,
        timezone: "Europe/London",
        title: "Persist test",
      }),
    });
    const booked = await bookRes.json();
    assert.equal(bookRes.status, 200);
    assert.equal(booked.ok, true);
    assert.ok(booked.data.id);

    const again = await fetch(`${base}/v1/calendar/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: slots.data[0].start,
        end: slots.data[0].end,
        timezone: "Europe/London",
      }),
    });
    const conflict = await again.json();
    assert.equal(again.status, 409);
    assert.equal(conflict.error, "slot_unavailable");
  });
});
