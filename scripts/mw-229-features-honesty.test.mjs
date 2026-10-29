import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("features page has funnel page metadata", () => {
  const page = read("src/app/features/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('funnelPageMetadata'));
});

test("features page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /Capability map/);
  assert.match(page, /Pre-launch/);
  assert.match(page, /What MaintenanceOS can do/);
});

test("features page has honesty banner with verified/under-test counts", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /VERIFIED/);
  assert.match(page, /UNDER_TEST/);
  assert.match(page, /cardCounts/);
});

test("features page has Bento feature grid", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /mos-bento-card/);
  assert.match(page, /grid gap/);
  assert.match(page, /grid-cols/);
});

test("features page has safe automation link", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /SafeAutomationLink/);
});

test("features page has CTA pair", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /CtaPair/);
  assert.match(page, /Request an early demo/);
});

test("features page references related pages", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /\/demo\//);
  assert.match(page, /Request an early demo/);
});