import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("release marker denies public launch GA live phone", () => {
  const writer = read("scripts/write-release-marker.mjs");
  assert.match(writer, /public_launch:\s*false/);
  assert.match(writer, /commercial_ga:\s*false/);
  assert.match(writer, /live_phone:\s*false/);
  assert.match(writer, /Pre-launch synthetic demo release marker/);
  assert.doesNotMatch(writer, /public_launch:\s*true/);
  assert.doesNotMatch(writer, /commercial_ga:\s*true/);
  assert.doesNotMatch(writer, /live_phone:\s*true/);
});

test("release preflight does not flip PUBLIC_LAUNCH", () => {
  const preflight = read("scripts/release-preflight.mjs");
  assert.doesNotMatch(preflight, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(preflight, /public_launch:\s*true/);
});

test("rollback plan is revert-only no shared history rewrite", () => {
  const rollback = read("scripts/rollback-plan.mjs");
  assert.match(rollback, /git revert --no-edit/);
  assert.doesNotMatch(rollback, /git push.*--force/);
  assert.doesNotMatch(rollback, /git push.*-f/);
  assert.match(rollback, /forbidden[\s\S]*reset --hard on shared main/);
});

test("manager loop checks release preflight compliance", () => {
  const manager = read("scripts/website-manager-loop.mjs");
  assert.match(manager, /website-health-monitor/);
  assert.match(manager, /seo-live-monitor/);
  assert.match(manager, /release:preflight/);
  assert.match(manager, /release:verify/);
});