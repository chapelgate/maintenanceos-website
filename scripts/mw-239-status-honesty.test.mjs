import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("status page has content page metadata", () => {
  const page = read("src/app/status/page.tsx");
  assert.ok(page.includes('title: "Status"'));
  assert.ok(page.includes('path: "/status/"'));
  assert.ok(page.includes('description:'));
  assert.ok(page.includes('contentPageMetadata'));
});

test("status page has PageHero with placeholder declaration", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /Placeholder/);
  assert.match(page, /not a live status page/);
  assert.match(page, /does not publish an uptime figure/);
});

test("status page has honest future status description", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /verified component health/);
  assert.match(page, /not invented/);
  assert.match(page, /percentages/);
  assert.match(page, /does not show live uptime metrics/);
});

test("status page has status.json reference", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /status\.json/);
  assert.match(page, /live false/);
  assert.match(page, /sla_claim false/);
  assert.match(page, /commercial_ga false/);
  assert.match(page, /live_phone false/);
  assert.match(page, /uptime_percent null/);
});

test("status page has future components list", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /Marketing site/);
  assert.match(page, /Lead-capture adapter/);
  assert.match(page, /Product API and voice runtime/);
});

test("status page has honest no fake metrics declaration", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /No fake uptime charts/);
  assert.match(page, /incident timelines/);
  assert.match(page, /SLA badges/);
  assert.match(page, /Metrics appear only when wired to real monitors/);
});