import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("property-maintenance-software page has funnel page metadata", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('funnelPageMetadata'));
  assert.ok(page.includes('propertyMaintenanceSoftware'));
});

test("property-maintenance-software page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /United Kingdom/);
  assert.match(page, /Pre-launch/);
  assert.match(page, /property maintenance software/);
});

test("property-maintenance-software page has honest lede about commitments", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /not marketed as a full property-accounting suite/);
  assert.match(page, /tenancy CRM/);
  assert.match(page, /autonomous dispatch system/);
});

test("property-maintenance-software page has honest workflow description", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /capture the issue/);
  assert.match(page, /preserve who\/what\/where\/access/);
  assert.match(page, /separate emergency guidance/);
});

test("property-maintenance-software page has UK roles grid", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /industryRoles/);
  assert.match(page, /mos-glass block/);
  assert.match(page, /Choose the role/);
});

test("property-maintenance-software page has pre-launch path section", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /Current pre-launch path/);
  assert.match(page, /Website.*Check.*Choose/);
  assert.match(page, /does not provision a live phone number/);
});

test("property-maintenance-software page references ai-receptionist", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /\/ai-receptionist\//);
});

test("property-maintenance-software page has CTA pair", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  assert.match(page, /CtaPair/);
});