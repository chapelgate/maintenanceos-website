import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

function assertMatchObjectFields(obj, fields) {
  for (const f of fields) {
    assert.ok(f in obj, `missing field ${f} in object`);
  }
}

test("public/release.json has all required fields", () => {
  const marker = readJson("public/release.json");
  assertMatchObjectFields(marker, [
    "schema", "commit", "builtAt", "product", "brand",
    "publisher", "company_number", "public_launch", "commercial_ga",
    "live_phone", "note",
  ]);
  assert.equal(marker.public_launch, false);
  assert.equal(marker.commercial_ga, false);
  assert.equal(marker.live_phone, false);
});

test("out/release.json matches public/release.json fields", () => {
  const marker = readJson("public/release.json");
  const outMarker = readJson("out/release.json");
  assert.equal(outMarker.schema, marker.schema);
  assert.equal(outMarker.public_launch, marker.public_launch);
  assert.equal(outMarker.commercial_ga, marker.commercial_ga);
  assert.equal(outMarker.live_phone, marker.live_phone);
  assert.match(outMarker.commit, /^[0-9a-f]{7,40}$/i);
});

test("public/status.json has all required fields matching release.json", () => {
  const marker = readJson("public/release.json");
  const status = readJson("public/status.json");
  assertMatchObjectFields(status, [
    "schema", "product", "brand", "publisher", "company_number",
    "live", "public_launch", "sla_claim", "uptime_percent",
    "incident_feed", "note", "commercial_ga", "live_phone",
  ]);
  assert.equal(status.live, false);
  assert.equal(status.public_launch, false);
  assert.equal(status.sla_claim, false);
  assert.equal(status.uptime_percent, null);
  assert.equal(status.commercial_ga, false);
  assert.equal(status.live_phone, false);
  assert.match(status.note, /Pre-launch synthetic demo/);
  assert.match(marker.note, /Pre-launch synthetic demo/);
});

test("health artifact: records HEAD SHA and redacts network/public claims", () => {
  const healthScript = read("scripts/write-health-artifact.mjs");
  assert.match(healthScript, /head: head\(\)/);
  assert.match(healthScript, /mode: "offline-config"/);
  assert.match(healthScript, /network: false/);
  assert.match(healthScript, /schema: 1/);
  assert.match(healthScript, /kind: "offline-health-artifact"/);
});

test("health artifact: does not claim uptime or SLA", () => {
  const healthScript = read("scripts/write-health-artifact.mjs");
  assert.doesNotMatch(healthScript, /uptime/);
  assert.doesNotMatch(healthScript, /SLA/);
  assert.doesNotMatch(healthScript, /99\.\d%/);
});
