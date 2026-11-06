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

// New: all public/ export JSON markers must have consistent schema + honesty
test("all public/ export JSON markers have consistent schema and honesty fields", () => {
  const files = ["public/release.json", "public/status.json"];
  const markers = files.map(f => readJson(f));
  for (const m of markers) {
    assertMatchObjectFields(m, ["schema", "public_launch", "commercial_ga", "live_phone", "note"]);
    assert.equal(m.schema, 1);
    assert.equal(m.public_launch, false);
    assert.equal(m.commercial_ga, false);
    assert.equal(m.live_phone, false);
    assert.match(m.note, /Pre-launch synthetic demo/);
  }
});

// New: out/ JSON markers must match public/ equivalents
test("out/ JSON markers match public/ counterparts for schema and honesty", () => {
  const outRelease = readJson("out/release.json");
  const pubRelease = readJson("public/release.json");
  assert.equal(outRelease.schema, pubRelease.schema);
  assert.equal(outRelease.public_launch, pubRelease.public_launch);
  assert.equal(outRelease.commercial_ga, pubRelease.commercial_ga);
  assert.equal(outRelease.live_phone, pubRelease.live_phone);
  assert.match(outRelease.commit, /^[0-9a-f]{7,40}$/i);

  const outStatus = readJson("out/status.json");
  const pubStatus = readJson("public/status.json");
  assert.equal(outStatus.live, pubStatus.live);
  assert.equal(outStatus.public_launch, pubStatus.public_launch);
  assert.equal(outStatus.commercial_ga, pubStatus.commercial_ga);
  assert.equal(outStatus.live_phone, pubStatus.live_phone);
  assert.equal(outStatus.uptime_percent, pubStatus.uptime_percent);
  assert.match(outStatus.note, /No live status/);
});

// New: health artifact cross-validates with release + status
test("health artifact cross-validates with release and status markers", () => {
  const healthScript = read("scripts/write-health-artifact.mjs");
  assert.match(healthScript, /recordedAt/);
  assert.match(healthScript, /head: head\(\)/);
  assert.match(healthScript, /mode: "offline-config"/);
  assert.match(healthScript, /network: false/);
  assert.match(healthScript, /schema: 1/);
  assert.match(healthScript, /kind: "offline-health-artifact"/);

  const outMarker = readJson("out/release.json");
  assert.match(outMarker.note, /Pre-launch synthetic demo/);
  assert.doesNotMatch(healthScript, /uptime/);
  assert.doesNotMatch(healthScript, /SLA/);
  assert.doesNotMatch(healthScript, /99\.\d%/);
});

// New: consolidated evidence test validates all honesty invariants
test("consolidated evidence invariants: release + status + health all deny launch+GA+phone+uptime", () => {
  const outRelease = readJson("out/release.json");
  const outStatus = readJson("out/status.json");

  // Release marker
  assert.equal(outRelease.public_launch, false);
  assert.equal(outRelease.commercial_ga, false);
  assert.equal(outRelease.live_phone, false);
  assert.match(outRelease.note, /Pre-launch synthetic demo/);
  assert.doesNotMatch(JSON.stringify(outRelease), /uptime/);
  assert.doesNotMatch(JSON.stringify(outRelease), /SLA/);
  assert.doesNotMatch(JSON.stringify(outRelease), /99\.\d%/);

  // Status marker
  assert.equal(outStatus.live, false);
  assert.equal(outStatus.public_launch, false);
  assert.equal(outStatus.commercial_ga, false);
  assert.equal(outStatus.live_phone, false);
  assert.equal(outStatus.sla_claim, false);
  assert.equal(outStatus.uptime_percent, null);
  assert.match(outStatus.note, /No live status/);
  assert.doesNotMatch(JSON.stringify(outStatus), /99\.\d%/);

  // Health artifact must not claim uptime/SLA
  const healthScript = read("scripts/write-health-artifact.mjs");
  assert.doesNotMatch(healthScript, /uptime/);
  assert.doesNotMatch(healthScript, /SLA/);
  assert.doesNotMatch(healthScript, /99\.\d%/);
});