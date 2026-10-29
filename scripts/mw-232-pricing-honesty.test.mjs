import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("pricing page has content page metadata", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('title: "Pricing"'));
  assert.ok(page.includes('path: "/pricing/"'));
});

test("pricing page has honest description with UK landlords/agents", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /UK landlords/);
  assert.match(page, /letting agents/);
  assert.match(page, /property managers/);
});

test("pricing page has honest designed-to-include list", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /Website Intake:/);
  assert.match(page, /Fixed Safety Latches:/);
  assert.match(page, /Audit Evidence:/);
});

test("pricing page has honest not-sold-as-live list", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /No live phone in a plan/);
  assert.match(page, /No self-serve checkout/);
  assert.match(page, /Calendar booking: coming/);
});

test("pricing page has honest price note", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /no self-serve checkout, no live phone/);
  assert.match(page, /Prices shown are indicative/);
  assert.match(page, /final quote provided on request/);
});

test("pricing page has PageHero with pricing title/lede", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /PageHero/);
  assert.match(page, /eyebrow/);
  assert.match(page, /title/);
  assert.match(page, /lede/);
});

test("pricing page has CtaPair component", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /CtaPair/);
});