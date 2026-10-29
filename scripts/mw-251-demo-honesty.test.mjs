import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("demo page has funnel page metadata", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes("funnelPageMetadata"));
  assert.ok(page.includes('funnelPageMetadata("demo")'));
  assert.ok(page.includes("fullFunnelPageJsonLd"));
});

test("demo page has PageHero with honest lede", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes('Start from your website URL'));
  assert.ok(page.includes('Not a live number'));
  assert.ok(page.includes('Not a live telephone call'));
  assert.ok(page.includes('does not assign a live number'));
  assert.ok(page.includes('not an offer for sale'));
  assert.ok(page.includes('not a booking'));
  assert.ok(page.includes('Pre-launch synthetic demo'));
});

test("demo page has FeatureStatusChip", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes('FeatureStatusChip'));
  assert.ok(page.includes('status="UNDER_TEST"'));
});

test("demo page has timeline steps", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes('STEP 1'));
  assert.ok(page.includes('STEP 2'));
  assert.ok(page.includes('STEP 3'));
  assert.ok(page.includes('Server rules evaluate hazards'));
  assert.ok(page.includes('Ticket held for clearance'));
});

test("demo page has journey steps reference", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes('CREATE_JOURNEY_STEPS'));
});

test("demo page has trust link reference", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes('href="/trust/"'));
  assert.ok(page.includes('Trust & verification'));
});