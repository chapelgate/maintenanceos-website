import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("website-manager-loop has monitor/preflight/verify/record commands", () => {
  const loop = read("scripts/website-manager-loop.mjs");
  const pkg = JSON.parse(read("package.json"));
  assert.match(loop, /monitor/);
  assert.match(loop, /preflight/);
  assert.match(loop, /verify/);
  assert.match(loop, /record/);
  assert.ok(pkg.scripts["manager:monitor"] || pkg.scripts["manager:preflight"]);
});

test("website-health-monitor uses WEBSITE_CONTROL_PLANE only opt-in control plane", () => {
  const monitor = read("scripts/website-health-monitor.mjs");
  assert.match(monitor, /WEBSITE_CONTROL_PLANE/);
  assert.match(monitor, /worksmartos.co.uk/);
});

test("deployment-verifier checks EXPECTED_COMMIT and release.json", () => {
  const verifier = read("scripts/deployment-verifier.mjs");
  assert.match(verifier, /EXPECTED_COMMIT/);
  assert.match(verifier, /release\.json/);
});

test("rollback-plan is revert-only", () => {
  const rollback = read("scripts/rollback-plan.mjs");
  assert.match(rollback, /git revert --no-edit/);
  assert.match(rollback, /git reset --hard on shared main/);
  assert.doesNotMatch(rollback, /execFileSync\("git", \["reset", "--hard"/);
});

test("synthetic demo script forbids the golden line and a public launch", () => {
  const demoDoc = read("docs/demo/ANDY_SYNTHETIC_DEMO.md");
  assert.match(demoDoc, /Do not call the golden phone line/);
  assert.match(demoDoc, /Do not set NEXT_PUBLIC_PUBLIC_LAUNCH to true/);
  assert.doesNotMatch(demoDoc, /0151 321 1920/);
});
