import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");

test("demo page is honest about synthetic demo data", () => {
  assert.match(page, /Pre-launch synthetic demo/);
  assert.match(page, /not an offer for sale/);
  assert.match(page, /not a booking/);
  assert.match(page, /Not a live telephone call/);
  assert.match(page, /does not assign a live number/);
  assert.match(page, /FeatureStatusChip status="UNDER_TEST"/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("demo page tabs and steps do not claim real data", () => {
  assert.match(page, /DeferredDemoConversionTabs/);
  assert.match(page, /CREATE_JOURNEY_STEPS/);
  assert.doesNotMatch(page, /real data/);
  assert.doesNotMatch(page, /live data/);
  assert.doesNotMatch(page, /production data/);
  assert.doesNotMatch(page, /customer data/);
});