import assert from "node:assert/strict";
import test from "node:test";
import { createCalendarAdapter } from "./factory.ts";
import { createMockCalendarAdapter } from "./mock.ts";
import type { CalendarAdapter } from "./types.ts";

const FROM = "2026-09-21T00:00:00.000Z";
const TO = "2026-09-22T00:00:00.000Z";
const NOW = () => new Date("2026-09-21T08:00:00.000Z");

async function assertAdapterContract(adapter: CalendarAdapter) {
  const slots = await adapter.listFreeSlots({
    from: FROM,
    to: TO,
    timezone: "Europe/London",
    durationMinutes: 30,
  });
  assert.equal(slots.ok, true);
  if (!slots.ok) return;
  assert.ok(slots.data.length >= 2);
  const first = slots.data[0];
  const later = slots.data[1];

  const booked = await adapter.createBooking({
    start: first.start,
    end: first.end,
    timezone: first.timezone,
    title: "Adapter contract",
  });
  assert.equal(booked.ok, true);
  if (!booked.ok) return;
  assert.equal(booked.data.status, "confirmed");
  assert.ok(booked.data.id);
  assert.equal(booked.data.provider, adapter.provider);

  const conflict = await adapter.createBooking({
    start: first.start,
    end: first.end,
    timezone: first.timezone,
    title: "Should fail",
  });
  assert.equal(conflict.ok, false);
  if (!conflict.ok) {
    assert.equal(conflict.error, "slot_unavailable");
    assert.match(conflict.message, /No booking was created/);
  }

  const afterBook = await adapter.listFreeSlots({
    from: FROM,
    to: TO,
    timezone: "Europe/London",
  });
  assert.equal(afterBook.ok, true);
  if (afterBook.ok) {
    assert.ok(!afterBook.data.some((slot) => slot.start === first.start));
  }

  const moved = await adapter.rescheduleBooking({
    id: booked.data.id,
    start: later.start,
    end: later.end,
    timezone: later.timezone,
  });
  assert.equal(moved.ok, true);
  if (moved.ok) {
    assert.equal(moved.data.id, booked.data.id);
    assert.equal(moved.data.start, later.start);
    assert.equal(moved.data.status, "confirmed");
  }

  const cancelled = await adapter.cancelBooking({ id: booked.data.id });
  assert.equal(cancelled.ok, true);
  if (cancelled.ok) assert.equal(cancelled.data.status, "cancelled");

  const missing = await adapter.cancelBooking({ id: "no-such-booking" });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error, "booking_not_found");
}

test("mock adapter satisfies list / book / conflict / reschedule / cancel", async () => {
  await assertAdapterContract(createMockCalendarAdapter({ now: NOW }));
});

test("factory returns disabled adapter when flag is off", async () => {
  const adapter = createCalendarAdapter({
    env: { CALENDAR_ADAPTERS_ENABLED: "false" },
    now: NOW,
  });
  const slots = await adapter.listFreeSlots({ from: FROM, to: TO });
  const booked = await adapter.createBooking({
    start: "2026-09-21T09:00:00.000Z",
    end: "2026-09-21T09:30:00.000Z",
  });
  assert.equal(slots.ok, false);
  assert.equal(booked.ok, false);
  if (!slots.ok) assert.equal(slots.error, "calendar_disabled");
  if (!booked.ok) {
    assert.equal(booked.error, "calendar_disabled");
    assert.match(booked.message, /No booking was created/);
  }
});

test("factory enables mock when CALENDAR_ADAPTERS_ENABLED=true", async () => {
  const adapter = createCalendarAdapter({
    env: { CALENDAR_ADAPTERS_ENABLED: "true", CALENDAR_ADAPTER_PROVIDER: "mock" },
    now: NOW,
  });
  assert.equal(adapter.provider, "mock");
  await assertAdapterContract(adapter);
});

test("factory defaults to mock when Google OAuth env is missing", async () => {
  const adapter = createCalendarAdapter({
    env: { CALENDAR_ADAPTERS_ENABLED: "true" },
    now: NOW,
  });
  assert.equal(adapter.provider, "mock");
  const booked = await adapter.createBooking({
    start: "2026-09-21T09:00:00.000Z",
    end: "2026-09-21T09:30:00.000Z",
  });
  assert.equal(booked.ok, true);
  if (booked.ok) assert.equal(booked.data.provider, "mock");
});

test("factory google provider without credentials is not_configured, not a fake booking", async () => {
  const adapter = createCalendarAdapter({
    env: {
      CALENDAR_ADAPTERS_ENABLED: "true",
      CALENDAR_ADAPTER_PROVIDER: "google",
    },
  });
  assert.equal(adapter.provider, "google");
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

test("factory microsoft provider without credentials is not_configured, not a fake booking", async () => {
  const adapter = createCalendarAdapter({
    env: {
      CALENDAR_ADAPTERS_ENABLED: "true",
      CALENDAR_ADAPTER_PROVIDER: "microsoft",
    },
  });
  assert.equal(adapter.provider, "microsoft");
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
