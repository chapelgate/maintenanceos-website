import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/dashboard/page.tsx"), "utf8");

test("dashboard route stays noindex and not a live portal", () => {
  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.match(page, /Not a live customer portal/i);
  assert.match(page, /SAMPLE \/ DEMO/);
  assert.match(page, /never live\s+production KPIs/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("dashboard does not invent live telephony on this route", () => {
  assert.match(page, /not wired to frozen telephony/i);
  assert.match(page, /Bookings are a calendar-adapter stub/i);
  assert.doesNotMatch(page, /live support desk/i);
  assert.doesNotMatch(page, /uptime guarantee/i);
});
