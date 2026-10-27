import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const status = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/status.json"), "utf8"),
);
const page = fs.readFileSync(path.join(ROOT, "src/app/status/page.tsx"), "utf8");

test("status.json denies live status, uptime, and SLA", () => {
  assert.equal(status.schema, 1);
  assert.equal(status.live, false);
  assert.equal(status.public_launch, false);
  assert.equal(status.sla_claim, false);
  assert.equal(status.uptime_percent, null);
  assert.equal(status.incident_feed, false);
  assert.match(status.note, /No live status/);
  assert.match(status.note, /SLA/);
  assert.doesNotMatch(JSON.stringify(status), /99\.\d%/);
});

test("status.json names Chapelgate Limited with company number", () => {
  assert.equal(status.product, "MaintenanceOS");
  assert.equal(status.brand, "WorkSmartOS");
  assert.equal(status.publisher, "Chapelgate Limited");
  assert.equal(status.company_number, "12340004");
});

test("status page links status.json and denies SLA claims", () => {
  assert.match(page, /href="\/status\.json"/);
  assert.match(page, /sla_claim false/);
  assert.match(page, /uptime_percent null/);
  assert.match(page, /does\s+not publish an SLA/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /99\.\d%/);
  assert.doesNotMatch(page, /uptime guarantee/i);
});
