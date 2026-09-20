import assert from "node:assert/strict";
import test from "node:test";
import {
  browserMockSlots,
  formatSlotLabel,
  mapBookingResponse,
  mapSlotsResponse,
  requestCalendarBooking,
  requestCalendarSlots,
  resetBrowserCalendarMock,
} from "./calendar-create.ts";

test("mapBookingResponse never invents an id", () => {
  assert.equal(mapBookingResponse(null), null);
  assert.equal(mapBookingResponse({ ok: true }), null);
  assert.equal(mapBookingResponse({ ok: true, data: { start: "x", end: "y" } }), null);
  assert.deepEqual(
    mapBookingResponse({
      ok: true,
      data: {
        id: "mock_booking_1",
        provider: "mock",
        start: "2026-09-21T08:00:00.000Z",
        end: "2026-09-21T08:30:00.000Z",
        timezone: "Europe/London",
        title: "Test",
        status: "confirmed",
      },
    }),
    {
      id: "mock_booking_1",
      provider: "mock",
      start: "2026-09-21T08:00:00.000Z",
      end: "2026-09-21T08:30:00.000Z",
      timezone: "Europe/London",
      title: "Test",
      status: "confirmed",
    },
  );
});

test("mapSlotsResponse ignores incomplete rows", () => {
  assert.deepEqual(mapSlotsResponse({ ok: true, data: [{ start: "only" }] }), []);
  assert.deepEqual(
    mapSlotsResponse({
      data: [
        {
          start: "2026-09-21T08:00:00.000Z",
          end: "2026-09-21T08:30:00.000Z",
        },
      ],
    }),
    [
      {
        start: "2026-09-21T08:00:00.000Z",
        end: "2026-09-21T08:30:00.000Z",
        timezone: "Europe/London",
      },
    ],
  );
});

test("requestCalendarSlots is disabled when the public flag is off", async () => {
  const result = await requestCalendarSlots({
    enabled: false,
    endpoint: "http://127.0.0.1:8789/v1/calendar",
    from: "2026-09-21T00:00:00.000Z",
    to: "2026-09-22T00:00:00.000Z",
  });
  assert.equal(result.status, "disabled");
});

test("in-browser mock lists workday slots and refuses double-book", async () => {
  resetBrowserCalendarMock();
  const now = new Date("2026-09-21T08:00:00.000Z");
  const listed = await requestCalendarSlots({
    enabled: true,
    endpoint: "",
    from: "2026-09-21T00:00:00.000Z",
    to: "2026-09-22T00:00:00.000Z",
    timezone: "Europe/London",
    now,
  });
  assert.equal(listed.status, "ok");
  if (listed.status !== "ok") return;
  assert.ok(listed.data.length > 0);
  const first = listed.data[0];
  const booked = await requestCalendarBooking({
    enabled: true,
    endpoint: "",
    start: first.start,
    end: first.end,
    timezone: first.timezone,
    title: "Mock test",
  });
  assert.equal(booked.status, "ok");
  if (booked.status === "ok") {
    assert.match(booked.data.id, /^browser_mock_/);
    assert.equal(booked.data.provider, "mock");
  }
  const again = await requestCalendarBooking({
    enabled: true,
    endpoint: "",
    start: first.start,
    end: first.end,
    timezone: first.timezone,
  });
  assert.equal(again.status, "error");
  if (again.status === "error") {
    assert.match(again.message, /No booking was created/);
  }
});

test("browserMockSlots skips a busy weekday hour", () => {
  resetBrowserCalendarMock();
  const slots = browserMockSlots({
    from: "2026-09-21T00:00:00.000Z",
    to: "2026-09-22T00:00:00.000Z",
    timezone: "Europe/London",
    now: new Date("2026-09-21T08:00:00.000Z"),
  });
  assert.ok(slots.some((slot) => slot.start === "2026-09-21T08:00:00.000Z"));
});

test("formatSlotLabel uses a UK-readable window", () => {
  const label = formatSlotLabel({
    start: "2026-09-21T08:00:00.000Z",
    end: "2026-09-21T08:30:00.000Z",
    timezone: "Europe/London",
  });
  assert.match(label, /21 Sep/);
  assert.match(label, /09:00/);
  assert.match(label, /09:30/);
});

test("requestCalendarBooking stays disabled when the flag is off", async () => {
  const result = await requestCalendarBooking({
    enabled: false,
    endpoint: "",
    start: "2026-09-21T08:00:00.000Z",
    end: "2026-09-21T08:30:00.000Z",
  });
  assert.equal(result.status, "disabled");
});
