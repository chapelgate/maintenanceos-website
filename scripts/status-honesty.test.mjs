import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("status page is a placeholder not a live status page", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /placeholder/);
  assert.match(page, /not a live status page/);
  assert.match(page, /does not publish an uptime figure/);
  assert.match(page, /no live status or uptime figures are shown here/);
  assert.match(page, /live false/);
  assert.match(page, /sla_claim false/);
  assert.match(page, /commercial_ga false/);
  assert.match(page, /live_phone false/);
  assert.match(page, /uptime_percent null/);
});

test("status page does not claim uptime/SLA/badge", () => {
  const page = read("src/app/status/page.tsx");
  assert.doesNotMatch(page, /No fake uptime charts and incident timelines or SLA badges are shown here/);
  assert.match(page, /No fake uptime charts/);
  assert.match(page, /Metrics appear only when wired to real monitors/);
});

test("status page does not claim monitored components", () => {
  const page = read("src/app/status/page.tsx");
  assert.match(page, /a future status page/);
  assert.match(page, /when wired to real monitors/);
  assert.match(page, /scanner remains frozen/);
});