import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/calendar-create.ts"), "utf8");

test("calendar-create exports CalendarSlot type", () => {
  assert.match(src, /export type CalendarSlot/);
});

test("calendar-create exports CalendarBooking type", () => {
  assert.match(src, /export type CalendarBooking/);
});

test("calendar-create exports CalendarOutcome type", () => {
  assert.match(src, /export type CalendarOutcome/);
});

test("calendar-create exports isAbsoluteHttpUrl function", () => {
  assert.match(src, /export function isAbsoluteHttpUrl/);
});

test("calendar-create exports calendarEndpointBase function", () => {
  assert.match(src, /export function calendarEndpointBase/);
});

test("calendar-create exports defaultSlotWindow function", () => {
  assert.match(src, /export function defaultSlotWindow/);
});

test("calendar-create exports formatSlotLabel function", () => {
  assert.match(src, /export function formatSlotLabel/);
});
