import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("release.json in out/ matches source commit at build time", () => {
  const marker = readJson("out/release.json");
  assert.equal(marker.schema, 1);
  assert.equal(marker.public_launch, false);
  assert.equal(marker.commercial_ga, false);
  assert.equal(marker.live_phone, false);
  assert.match(marker.commit, /^[0-9a-f]{7,40}$/i);
  assert.ok(typeof marker.builtAt === "string" && marker.builtAt.length > 0);
});

test("public/release.json in out/ matches source commit at build time", () => {
  const marker = readJson("public/release.json");
  assert.equal(marker.schema, 1);
  assert.equal(marker.public_launch, false);
  assert.equal(marker.commercial_ga, false);
  assert.equal(marker.live_phone, false);
  assert.match(marker.commit, /^[0-9a-f]{7,40}$/i);
  assert.ok(typeof marker.builtAt === "string" && marker.builtAt.length > 0);
});

test("out/release.json and public/release.json share identical commit and honesty fields", () => {
  const outMarker = readJson("out/release.json");
  const pubMarker = readJson("public/release.json");
  assert.equal(outMarker.commit, pubMarker.commit);
  assert.equal(outMarker.public_launch, pubMarker.public_launch);
  assert.equal(outMarker.commercial_ga, pubMarker.commercial_ga);
  assert.equal(outMarker.live_phone, pubMarker.live_phone);
});

test("health artifact timestamp matches release marker commitment", () => {
  const healthArtifact = read("scripts/write-health-artifact.mjs");
  assert.match(healthArtifact, /recordedAt: new Date\(\)\.toISOString\(\)/);
  assert.match(healthArtifact, /head: head\(\)/);
});

test("release marker and health artifact share commit source truth", () => {
  const writeRelease = read("scripts/write-release-marker.mjs");
  const writeHealth = read("scripts/write-health-artifact.mjs");
  // Both use git rev-parse HEAD
  assert.match(writeRelease, /execFileSync\("git", \["rev-parse", "HEAD"\]/);
  assert.match(writeHealth, /execFileSync\("git", \["rev-parse", "HEAD"\]/);
});

test("observability suite documents opt-in control plane honestly", () => {
  const suite = read("scripts/observability-suite.test.mjs");
  assert.match(suite, /WEBSITE_CONTROL_PLANE/);
  assert.match(suite, /worksmartos\.co\.uk/);
  assert.match(suite, /opt-in/);
  assert.doesNotMatch(suite, /railway\.app/);
});

test("no uptime/SLA claims in release marker or health artifact", () => {
  const writeRelease = read("scripts/write-release-marker.mjs");
  const writeHealth = read("scripts/write-health-artifact.mjs");
  assert.doesNotMatch(writeRelease, /99\.\d%/);
  assert.doesNotMatch(writeRelease, /uptime/);
  assert.doesNotMatch(writeHealth, /uptime/);
  assert.doesNotMatch(writeHealth, /SLA/);
});

test("release.json honesty fields deny public launch, GA, live phone", () => {
  const outMarker = readJson("out/release.json");
  const pubMarker = readJson("public/release.json");
  for (const m of [outMarker, pubMarker]) {
    assert.equal(m.public_launch, false, "public_launch must be false");
    assert.equal(m.commercial_ga, false, "commercial_ga must be false");
    assert.equal(m.live_phone, false, "live_phone must be false");
    assert.match(m.note, /Pre-launch synthetic demo/);
    assert.doesNotMatch(JSON.stringify(m), /uptime/);
    assert.doesNotMatch(JSON.stringify(m), /SLA/);
    assert.doesNotMatch(JSON.stringify(m), /99\.\d%/);
  }
});

test("status.json and release.json share consistent pre-launch note", () => {
  const outMarker = readJson("out/release.json");
  const status = readJson("public/status.json");
  assert.equal(status.live, false);
  assert.equal(status.public_launch, false);
  assert.equal(status.commercial_ga, false);
  assert.equal(status.live_phone, false);
  assert.equal(status.uptime_percent, null);
  assert.match(status.note, /No live status/);
  assert.match(status.note, /uptime figure/);
  assert.match(status.note, /SLA/);
  assert.match(outMarker.note, /Pre-launch synthetic demo/);
  assert.match(outMarker.note, /Not commercially generally available/);
});

test("health artifact schema matches release marker schema and honesty", () => {
  const outMarker = readJson("out/release.json");
  const healthScript = read("scripts/write-health-artifact.mjs");
  assert.match(healthScript, /schema: 1/);
  assert.match(healthScript, /kind: "offline-health-artifact"/);
  assert.match(healthScript, /network: false/);
  assert.match(healthScript, /mode: "offline-config"/);
  assert.match(healthScript, /controlPlaneOptInOnly:/);
  assert.match(healthScript, /retiredRailwayDefaultAbsent:/);
  assert.match(outMarker.note, /Pre-launch synthetic demo/);
  assert.doesNotMatch(JSON.stringify(outMarker), /uptime/);
  assert.doesNotMatch(JSON.stringify(outMarker), /SLA/);
  assert.doesNotMatch(JSON.stringify(outMarker), /99\.\d%/);
});