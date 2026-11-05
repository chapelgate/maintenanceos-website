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