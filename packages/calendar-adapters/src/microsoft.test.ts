import assert from "node:assert/strict";
import test from "node:test";
import { createMicrosoftCalendarAdapter } from "./microsoft.ts";
import { microsoftAuthorizationUrl } from "./oauth.ts";

const ENV = {
  MICROSOFT_CALENDAR_CLIENT_ID: "client",
  MICROSOFT_CALENDAR_CLIENT_SECRET: "secret",
  MICROSOFT_CALENDAR_REFRESH_TOKEN: "refresh",
  MICROSOFT_CALENDAR_TENANT_ID: "common",
};

test("microsoft adapter is not_configured without OAuth env", async () => {
  const adapter = createMicrosoftCalendarAdapter({ env: {} });
  const booked = await adapter.createBooking({
    start: "2026-09-21T09:00:00.000Z",
    end: "2026-09-21T09:30:00.000Z",
  });
  assert.equal(booked.ok, false);
  if (!booked.ok) {
    assert.equal(booked.error, "not_configured");
    assert.match(booked.message, /No booking was created/);
  }
});

test("microsoft adapter maps getSchedule busy periods", async () => {
  const fetchFn: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/oauth2/v2.0/token")) {
      return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), {
        status: 200,
      });
    }
    if (url.includes("/getSchedule")) {
      return new Response(
        JSON.stringify({
          value: [
            {
              scheduleItems: [
                {
                  start: { dateTime: "2026-09-21T09:00:00", timeZone: "UTC" },
                  end: { dateTime: "2026-09-21T10:00:00", timeZone: "UTC" },
                },
              ],
            },
          ],
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 500 });
  };
  const adapter = createMicrosoftCalendarAdapter({
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
    assert.ok(slots.data.some((slot) => slot.start === "2026-09-21T08:00:00.000Z"));
  }
});

test("microsoft adapter cancel is not invented on 404", async () => {
  const fetchFn: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/token")) {
      return new Response(JSON.stringify({ access_token: "tok" }), { status: 200 });
    }
    return new Response("{}", { status: 404 });
  };
  const adapter = createMicrosoftCalendarAdapter({ env: ENV, fetch: fetchFn });
  const cancelled = await adapter.cancelBooking({ id: "missing" });
  assert.equal(cancelled.ok, false);
  if (!cancelled.ok) assert.equal(cancelled.error, "booking_not_found");
});

test("microsoftAuthorizationUrl documents Graph calendar scopes", () => {
  const url = microsoftAuthorizationUrl("cid", "http://127.0.0.1:8789/oauth/microsoft");
  assert.match(url, /login\.microsoftonline\.com\/common/);
  assert.match(url, /Calendars\.ReadWrite/);
  assert.match(url, /offline_access/);
});
