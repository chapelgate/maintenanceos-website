import assert from "node:assert/strict";
import test from "node:test";
import { createGoogleCalendarAdapter } from "./google.ts";
import { googleAuthorizationUrl } from "./oauth.ts";

const ENV = {
  GOOGLE_CALENDAR_CLIENT_ID: "client",
  GOOGLE_CALENDAR_CLIENT_SECRET: "secret",
  GOOGLE_CALENDAR_REFRESH_TOKEN: "refresh",
  GOOGLE_CALENDAR_CALENDAR_ID: "primary",
};

test("google adapter is not_configured without OAuth env", async () => {
  const adapter = createGoogleCalendarAdapter({ env: {} });
  const slots = await adapter.listFreeSlots({
    from: "2026-09-21T00:00:00.000Z",
    to: "2026-09-22T00:00:00.000Z",
  });
  const booked = await adapter.createBooking({
    start: "2026-09-21T09:00:00.000Z",
    end: "2026-09-21T09:30:00.000Z",
  });
  assert.equal(slots.ok, false);
  assert.equal(booked.ok, false);
  if (!slots.ok) assert.equal(slots.error, "not_configured");
  if (!booked.ok) {
    assert.equal(booked.error, "not_configured");
    assert.match(booked.message, /No booking was created/);
  }
});

test("google adapter maps freeBusy and refuses invented bookings", async () => {
  const calls: { url: string; method: string }[] = [];
  const fetchFn: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    calls.push({ url, method });
    if (url.includes("oauth2.googleapis.com/token")) {
      return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), {
        status: 200,
      });
    }
    if (url.endsWith("/freeBusy")) {
      return new Response(
        JSON.stringify({
          calendars: {
            primary: {
              busy: [
                { start: "2026-09-21T09:00:00.000Z", end: "2026-09-21T10:00:00.000Z" },
              ],
            },
          },
        }),
        { status: 200 },
      );
    }
    if (method === "POST" && url.includes("/events")) {
      return new Response(JSON.stringify({ error: "conflict" }), { status: 409 });
    }
    return new Response("nope", { status: 500 });
  };

  const adapter = createGoogleCalendarAdapter({
    env: ENV,
    fetch: fetchFn,
    now: () => new Date("2026-09-21T08:00:00.000Z"),
  });
  const slots = await adapter.listFreeSlots({
    from: "2026-09-21T00:00:00.000Z",
    to: "2026-09-22T00:00:00.000Z",
    timezone: "Europe/London",
  });
  assert.equal(slots.ok, true);
  if (slots.ok) {
    assert.ok(!slots.data.some((slot) => slot.start === "2026-09-21T09:00:00.000Z"));
    assert.ok(slots.data.length > 0);
  }
  const booked = await adapter.createBooking({
    start: "2026-09-21T08:00:00.000Z",
    end: "2026-09-21T08:30:00.000Z",
    timezone: "Europe/London",
  });
  assert.equal(booked.ok, false);
  if (!booked.ok) {
    assert.equal(booked.error, "provider_error");
    assert.match(booked.message, /No booking was invented/);
  }
  assert.ok(calls.some((call) => call.url.includes("/freeBusy")));
});

test("google adapter returns a booking only when the API returns an id", async () => {
  const fetchFn: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    if (url.includes("/token")) {
      return new Response(JSON.stringify({ access_token: "tok" }), { status: 200 });
    }
    if (method === "POST" && url.includes("/events")) {
      return new Response(
        JSON.stringify({
          id: "evt_1",
          summary: "Visit",
          start: { dateTime: "2026-09-21T08:00:00.000Z", timeZone: "Europe/London" },
          end: { dateTime: "2026-09-21T08:30:00.000Z", timeZone: "Europe/London" },
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 404 });
  };
  const adapter = createGoogleCalendarAdapter({ env: ENV, fetch: fetchFn });
  const booked = await adapter.createBooking({
    start: "2026-09-21T08:00:00.000Z",
    end: "2026-09-21T08:30:00.000Z",
  });
  assert.equal(booked.ok, true);
  if (booked.ok) {
    assert.equal(booked.data.id, "evt_1");
    assert.equal(booked.data.provider, "google");
  }
});

test("googleAuthorizationUrl documents offline calendar scopes", () => {
  const url = googleAuthorizationUrl("cid", "http://127.0.0.1:8789/oauth/google");
  assert.match(url, /accounts\.google\.com/);
  assert.match(url, /access_type=offline/);
  assert.match(url, /calendar\.events/);
});
