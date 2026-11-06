import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const demoClaimsPath = read("src/app/demo/page.tsx");
const buyersClaimsPath = read("src/app/buyers/page.tsx");

// New: demo page must not claim live booking or paid checkout
test("demo page does not claim live booking/checkout/paid", () => {
  assert.doesNotMatch(demoClaimsPath, /live booking/);
  assert.doesNotMatch(demoClaimsPath, /live calendar/);
  assert.doesNotMatch(demoClaimsPath, /paid checkout/);
  assert.doesNotMatch(demoClaimsPath, /commercially generally available/);
  assert.doesNotMatch(demoClaimsPath, /GA/);
});

// New: demo page documents synthetic nature honestly
test("demo page documents synthetic/pre-launch nature honestly", () => {
  assert.match(demoClaimsPath, /synthetic|pre-launch|demo|preview/i);
});

// New: buyers page confirms demo data is synthetic
test("buyers page confirms demo data is synthetic (no live customer records)", () => {
  assert.match(buyersClaimsPath, /synthetic/);
  assert.match(buyersClaimsPath, /no live customer/i);
});

// New: demo page does not claim real phone/calendar integration
test("demo page does not claim real phone or calendar integration", () => {
  assert.doesNotMatch(demoClaimsPath, /real phone/);
  assert.doesNotMatch(demoClaimsPath, /live phone/);
  assert.doesNotMatch(demoClaimsPath, /real calendar/);
  assert.doesNotMatch(demoClaimsPath, /live calendar/);
});