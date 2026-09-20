import assert from "node:assert/strict";
import test from "node:test";
import { computeFreeSlots, validateRange } from "./slots.ts";

test("validateRange rejects inverted or junk instants", () => {
  assert.equal(validateRange("", "2026-09-21T12:00:00Z").ok, false);
  assert.equal(
    validateRange("2026-09-21T12:00:00Z", "2026-09-21T11:00:00Z").ok,
    false,
  );
  assert.equal(
    validateRange("2026-09-21T11:00:00Z", "2026-09-21T12:00:00Z").ok,
    true,
  );
});

test("computeFreeSlots skips weekends, busy blocks, and past slots", () => {
  const now = new Date("2026-09-21T08:00:00.000Z"); // Monday 09:00 London (BST)
  const slots = computeFreeSlots({
    from: new Date("2026-09-21T00:00:00.000Z"),
    to: new Date("2026-09-22T00:00:00.000Z"),
    timezone: "Europe/London",
    slotMinutes: 30,
    now,
    busy: [
      {
        start: new Date("2026-09-21T09:00:00.000Z"), // 10:00 London
        end: new Date("2026-09-21T10:00:00.000Z"),
      },
    ],
  });
  assert.ok(slots.length > 0);
  assert.equal(slots[0]?.start, "2026-09-21T08:00:00.000Z");
  assert.ok(!slots.some((slot) => slot.start === "2026-09-21T09:00:00.000Z"));
  assert.ok(!slots.some((slot) => slot.start === "2026-09-21T09:30:00.000Z"));
  assert.ok(slots.every((slot) => slot.timezone === "Europe/London"));
});
