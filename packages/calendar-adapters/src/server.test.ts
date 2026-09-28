import assert from "node:assert/strict";
import test from "node:test";
import { createMockCalendarAdapter } from "./mock.ts";
import { createMemoryTokenStore } from "./tokens.ts";
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

test("GET /health reports flag off, no telephony, and Google/Microsoft not live on staging", async () => {
  await withServer({ adaptersEnabled: false }, async (base) => {
    const res = await fetch(`${base}/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.adaptersEnabled, false);
    assert.equal(json.telephony, false);
    assert.equal(json.googleCalendarLiveOnStaging, false);
    assert.equal(json.microsoftCalendarLiveOnStaging, false);
    assert.equal(json.googleOAuth.clientConfigured, false);
    assert.equal(json.googleOAuth.tokenPresent, false);
    assert.equal(json.googleOAuth.startPath, "/oauth/google/start");
    assert.equal(json.googleOAuth.callbackPath, "/oauth/google/callback");
    assert.equal(json.microsoftOAuth.clientConfigured, false);
    assert.equal(json.microsoftOAuth.tokenPresent, false);
    assert.equal(json.microsoftOAuth.startPath, "/oauth/microsoft/start");
    assert.equal(json.microsoftOAuth.callbackPath, "/oauth/microsoft/callback");
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
        from: "2030-01-07T00:00:00.000Z",
        to: "2030-01-08T00:00:00.000Z",
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

test("GET /oauth/google/start is 503 when client env is missing", async () => {
  await withServer(
    { adaptersEnabled: true, env: { CALENDAR_ADAPTER_PROVIDER: "mock" } },
    async (base) => {
      const res = await fetch(`${base}/oauth/google/start`, { redirect: "manual" });
      assert.equal(res.status, 503);
      const json = await res.json();
      assert.equal(json.error, "not_configured");
    },
  );
});

test("GET /oauth/microsoft/start is 503 when client env is missing", async () => {
  await withServer(
    { adaptersEnabled: true, env: { CALENDAR_ADAPTER_PROVIDER: "mock" } },
    async (base) => {
      const res = await fetch(`${base}/oauth/microsoft/start`, { redirect: "manual" });
      assert.equal(res.status, 503);
      const json = await res.json();
      assert.equal(json.error, "not_configured");
    },
  );
});

test("Google OAuth callback stores a token then list/book can use the store", async () => {
  const tokenStore = createMemoryTokenStore();
  const env = {
    CALENDAR_ADAPTERS_ENABLED: "true",
    CALENDAR_ADAPTER_PROVIDER: "google",
    GOOGLE_CALENDAR_CLIENT_ID: "client",
    GOOGLE_CALENDAR_CLIENT_SECRET: "secret",
  };
  const fetchFn: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const rawBody = init?.body;
    const body =
      typeof rawBody === "string"
        ? rawBody
        : rawBody instanceof URLSearchParams
          ? rawBody.toString()
          : String(rawBody ?? "");
    if (url.includes("oauth2.googleapis.com/token")) {
      if (body.includes("grant_type=authorization_code")) {
        return new Response(
          JSON.stringify({
            access_token: "at",
            refresh_token: "rt-from-code",
            expires_in: 3600,
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ access_token: "at", expires_in: 3600 }), {
        status: 200,
      });
    }
    if (url.endsWith("/freeBusy")) {
      return new Response(JSON.stringify({ calendars: { primary: { busy: [] } } }), {
        status: 200,
      });
    }
    if (method === "POST" && url.includes("/events")) {
      return new Response(
        JSON.stringify({
          id: "evt_oauth",
          summary: "OAuth booking",
          start: { dateTime: "2026-09-21T08:00:00.000Z", timeZone: "Europe/London" },
          end: { dateTime: "2026-09-21T08:30:00.000Z", timeZone: "Europe/London" },
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 500 });
  };

  await withServer(
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      fetch: fetchFn,
    },
    async (base) => {
      const start = await fetch(`${base}/oauth/google/start`, { redirect: "manual" });
      assert.equal(start.status, 302);
      const location = start.headers.get("location");
      assert.ok(location);
      const state = new URL(location).searchParams.get("state");
      assert.ok(state);

      const callback = await fetch(
        `${base}/oauth/google/callback?code=auth-code&state=${state}`,
      );
      const html = await callback.text();
      assert.equal(callback.status, 200);
      assert.match(html, /token stored locally/i);
      assert.equal((await tokenStore.get("google"))?.refreshToken, "rt-from-code");

      const health = await fetch(`${base}/health`);
      const healthJson = await health.json();
      assert.equal(healthJson.googleOAuth.clientConfigured, true);
      assert.equal(healthJson.googleOAuth.tokenPresent, true);
      assert.equal(healthJson.googleCalendarLiveOnStaging, false);

      const bookRes = await fetch(`${base}/v1/calendar/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: "2026-09-21T08:00:00.000Z",
          end: "2026-09-21T08:30:00.000Z",
          timezone: "Europe/London",
          title: "OAuth adapter test",
        }),
      });
      const booked = await bookRes.json();
      assert.equal(bookRes.status, 200);
      assert.equal(booked.ok, true);
      assert.equal(booked.data.id, "evt_oauth");
      assert.equal(booked.data.provider, "google");
    },
  );
});

test("Microsoft OAuth callback stores a token then list/book can use the store", async () => {
  const tokenStore = createMemoryTokenStore();
  const env = {
    CALENDAR_ADAPTERS_ENABLED: "true",
    CALENDAR_ADAPTER_PROVIDER: "microsoft",
    MICROSOFT_CALENDAR_CLIENT_ID: "client",
    MICROSOFT_CALENDAR_CLIENT_SECRET: "secret",
  };
  const fetchFn: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const rawBody = init?.body;
    const body =
      typeof rawBody === "string"
        ? rawBody
        : rawBody instanceof URLSearchParams
          ? rawBody.toString()
          : String(rawBody ?? "");
    if (url.includes("login.microsoftonline.com") && url.includes("/token")) {
      if (body.includes("grant_type=authorization_code")) {
        return new Response(
          JSON.stringify({
            access_token: "at",
            refresh_token: "rt-ms-from-code",
            expires_in: 3600,
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ access_token: "at", expires_in: 3600 }), {
        status: 200,
      });
    }
    if (url.includes("/getSchedule")) {
      return new Response(JSON.stringify({ value: [{ scheduleItems: [] }] }), {
        status: 200,
      });
    }
    if (method === "POST" && url.includes("/me/events")) {
      return new Response(
        JSON.stringify({
          id: "evt_ms_oauth",
          subject: "OAuth booking",
          start: { dateTime: "2026-09-21T08:00:00.000Z", timeZone: "Europe/London" },
          end: { dateTime: "2026-09-21T08:30:00.000Z", timeZone: "Europe/London" },
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 500 });
  };

  await withServer(
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      fetch: fetchFn,
    },
    async (base) => {
      const start = await fetch(`${base}/oauth/microsoft/start`, { redirect: "manual" });
      assert.equal(start.status, 302);
      const location = start.headers.get("location");
      assert.ok(location);
      const state = new URL(location).searchParams.get("state");
      assert.ok(state);

      const callback = await fetch(
        `${base}/oauth/microsoft/callback?code=auth-code&state=${state}`,
      );
      const html = await callback.text();
      assert.equal(callback.status, 200);
      assert.match(html, /token stored locally/i);
      assert.equal((await tokenStore.get("microsoft"))?.refreshToken, "rt-ms-from-code");

      const health = await fetch(`${base}/health`);
      const healthJson = await health.json();
      assert.equal(healthJson.microsoftOAuth.clientConfigured, true);
      assert.equal(healthJson.microsoftOAuth.tokenPresent, true);
      assert.equal(healthJson.microsoftCalendarLiveOnStaging, false);

      const bookRes = await fetch(`${base}/v1/calendar/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: "2026-09-21T08:00:00.000Z",
          end: "2026-09-21T08:30:00.000Z",
          timezone: "Europe/London",
          title: "OAuth adapter test",
        }),
      });
      const booked = await bookRes.json();
      assert.equal(bookRes.status, 200);
      assert.equal(booked.ok, true);
      assert.equal(booked.data.id, "evt_ms_oauth");
      assert.equal(booked.data.provider, "microsoft");
    },
  );
});
