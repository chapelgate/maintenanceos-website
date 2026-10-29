import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("industries page has content page metadata", () => {
  const page = read("src/app/industries/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('title: "Repair Intake Software by Sector (UK)"'));
  assert.ok(page.includes('path: "/industries/"'));
});

test("industries page has honest sector summaries", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /landlords/);
  assert.match(page, /letting-agents/);
  assert.match(page, /property-managers/);
  assert.match(page, /maintenance-companies/);
  assert.match(page, /housing-associations/);
  assert.match(page, /facilities-management/);
  assert.match(page, /councils/);
  assert.match(page, /holiday-lets/);
});

test("industries page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /Sectors/);
  assert.match(page, /Pre-launch/);
  assert.match(page, /not a live phone/);
  assert.match(page, /AI assists with intake/);
});

test("industries page has honest core safety note", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /Pre-launch: Core safety controls/);
  assert.match(page, /not a live phone/);
});

test("industries page has honest what a public phone is not", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /emergency triage vs jobs/);
  assert.match(page, /contractor-dispatch language/);
  assert.match(page, /out-of-hours honesty/);
  assert.match(page, /no client-money/);
});

test("industries page references how-we-keep-control", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /\/how-we-keep-control\//);
});

test("industries page has CtaPair component", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /CtaPair/);
});