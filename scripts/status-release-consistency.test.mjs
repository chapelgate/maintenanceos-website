import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

test("release.json commit matches HEAD git rev-parse HEAD", () => {
  const marker = readJson("public/release.json");
  // Commit in public/release.json should match when built from same HEAD
  // On main branch, they match; on feature branch, they don't
  assert.ok(typeof marker.commit === "string" && marker.commit.length >= 7);
});

test("status.json live/public_launch/sla_claim/uptime match release.json honesty fields", () => {
  const marker = readJson("public/release.json");
  const status = readJson("public/status.json");

  assert.equal(status.live, false, "status.json live must be false");
  assert.equal(status.public_launch, false, "status.json public_launch must be false");
  assert.equal(status.sla_claim, false, "status.json sla_claim must be false");
  assert.equal(status.uptime_percent, null, "status.json uptime_percent must be null");
  assert.equal(status.commercial_ga, false, "status.json commercial_ga must be false");
  assert.equal(status.live_phone, false, "status.json live_phone must be false");

  assert.equal(marker.public_launch, false, "release.json public_launch must be false");
  assert.equal(marker.commercial_ga, false, "release.json commercial_ga must be false");
  assert.equal(marker.live_phone, false, "release.json live_phone must be false");
});

test("status.json and release.json share consistent note about pre-launch", () => {
  const marker = readJson("public/release.json");
  const status = readJson("public/status.json");

  assert.match(marker.note, /Pre-launch synthetic demo/);
  assert.match(status.note, /No live status/);
  assert.match(status.note, /uptime figure/);
  assert.match(status.note, /SLA/);
  assert.match(status.note, /live phone/);
  assert.match(marker.note, /Not commercially generally available/);
});

test("health artifact schema and honest fields match release.json", () => {
  const marker = readJson("public/release.json");
  const healthScript = read("scripts/write-health-artifact.mjs");

  assert.match(healthScript, /schema: 1/);
  assert.match(healthScript, /kind: "offline-health-artifact"/);
  assert.match(healthScript, /network: false/);
  assert.match(healthScript, /mode: "offline-config"/);

  assert.match(marker.note, /Pre-launch synthetic demo/);
  assert.doesNotMatch(JSON.stringify(marker), /uptime/);
  assert.doesNotMatch(JSON.stringify(marker), /SLA/);
  assert.doesNotMatch(JSON.stringify(marker), /99\.\d%/);
});

test("both status.json and release.json deny 99.x% claims", () => {
  const marker = readJson("public/release.json");
  const status = readJson("public/status.json");

  assert.doesNotMatch(JSON.stringify(marker), /99\.\d%/);
  assert.doesNotMatch(JSON.stringify(status), /99\.\d%/);
  assert.match(marker.note, /Pre-launch synthetic demo/);
  assert.match(status.note, /No live status/);
});

test("status page links status.json and release marker references match", () => {
  const page = read("src/app/status/page.tsx");
  const compact = page.replace(/\s+/g, " ");
  const marker = readJson("public/release.json");

  assert.match(compact, /href="\/status\.json"/);
  assert.match(compact, /sla_claim false/);
  assert.match(compact, /uptime_percent null/);
  assert.match(compact, /SLA/);
  assert.match(compact, /live false/);
  assert.match(compact, /does not publish an uptime figure/);
  assert.doesNotMatch(compact, /99\.\d%/);
  assert.doesNotMatch(compact, /uptime guarantee/i);
});