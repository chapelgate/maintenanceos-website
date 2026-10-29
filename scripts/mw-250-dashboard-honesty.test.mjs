import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("dashboard page has content page metadata", () => {
  const page = read("src/app/dashboard/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('path: "/dashboard/"'));
  assert.ok(page.includes('Customer dashboard'));
});

test("dashboard page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/dashboard/page.tsx");
  assert.ok(page.includes('preview coming soon'));
  assert.ok(page.includes('Not a live customer portal'));
  assert.ok(page.includes('SAMPLE'));
  assert.ok(page.includes('CtaPair'));
});

test("dashboard page has honest limits section", () => {
  const page = read("src/app/dashboard/page.tsx");
  assert.ok(page.includes('Honest limits'));
  assert.ok(page.includes('live sample catalogue is on the demo page'));
  assert.ok(page.includes('SAMPLE / DEMO rows are examples for local testing'));
  assert.ok(page.includes('empty store does not invent customers'));
  assert.ok(page.includes('Bookings are a calendar-adapter stub'));
  assert.ok(page.includes('Live telephony changes stay gated'));
});