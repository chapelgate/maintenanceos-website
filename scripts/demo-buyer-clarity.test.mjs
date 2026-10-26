import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const demo = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");

test("demo page states buyer clarity", () => {
  assert.match(demo, /not an offer for sale/i);
  assert.match(demo, /not a booking/i);
  assert.match(demo, /Pre-launch synthetic demo/i);
  assert.match(demo, /Not a live telephone call/);
  assert.match(demo, /does not assign a live\s+number/);
  assert.doesNotMatch(demo, /buy now/i);
  assert.doesNotMatch(demo, /£/);
  assert.doesNotMatch(demo, /live phone number/i);
});

test("demo page recovery links stay pre-launch", () => {
  assert.match(demo, /href="\/trust\/"/);
  assert.doesNotMatch(demo, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
