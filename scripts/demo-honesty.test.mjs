import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("demo page is honest about pre-launch synthetic nature", () => {
  const page = read("src/app/demo/page.tsx");
  assert.match(page, /Pre-launch synthetic demo/);
  assert.match(page, /Not a live telephone call/);
  assert.match(page, /does not assign a live\s+number/);
  assert.match(page, /not an offer for sale/i);
  assert.match(page, /not a booking/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("demo page recovery links stay pre-launch", () => {
  const page = read("src/app/demo/page.tsx");
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /Scripted preview only — not a live support desk/);
});

test("demo page does not claim live phone or calendar", () => {
  const page = read("src/app/demo/page.tsx");
  assert.doesNotMatch(page, /live phone/i);
  assert.doesNotMatch(page, /calendar connection/);
  assert.doesNotMatch(page, /phone provisioning/);
});

test("demo page FeatureStatusChip is UNDER_TEST not live", () => {
  const page = read("src/app/demo/page.tsx");
  assert.match(page, /FeatureStatusChip/);
  assert.match(page, /UNDER_TEST/);
  assert.doesNotMatch(page, /LIVE/);
  assert.doesNotMatch(page, /GA/);
});