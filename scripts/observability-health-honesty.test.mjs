import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("health artifact bans network probes and public launch", () => {
  const artifact = read("scripts/write-health-artifact.mjs");
  assert.match(artifact, /no live HTTP probe/i);
  assert.match(artifact, /Does not set NEXT_PUBLIC_PUBLIC_LAUNCH=true/);
  assert.match(artifact, /Does not call the golden phone line/);
});

test("health artifact records head SHA and retired Railway default", () => {
  const artifact = read("scripts/write-health-artifact.mjs");
  assert.match(artifact, /retiredRailwayDefaultAbsent/);
  assert.match(artifact, /controlPlaneOptInOnly/);
  assert.match(artifact, /WEBSITE_CONTROL_PLANE/);
});

test("health artifact schema does not claim production uptime or SLA", () => {
  const artifact = read("scripts/write-health-artifact.mjs");
  assert.doesNotMatch(artifact, /uptime/);
  assert.doesNotMatch(artifact, /SLA/);
  assert.doesNotMatch(artifact, /production health/);
});

test("health artifact does not claim live customer records", () => {
  const artifact = read("scripts/write-health-artifact.mjs");
  assert.doesNotMatch(artifact, /live customer/);
  assert.doesNotMatch(artifact, /production deploy/);
  assert.doesNotMatch(artifact, /0151\s*321\s*1920/);
});

test("website-health-monitor does not claim production uptime guarantee", () => {
  const monitor = read("scripts/website-health-monitor.mjs");
  assert.doesNotMatch(monitor, /uptime guarantee/);
  assert.doesNotMatch(monitor, /SLA/);
  assert.doesNotMatch(monitor, /production uptime/);
});

test("observability docs do not claim field Core Web Vitals", () => {
  const a11y = read("src/app/accessibility/page.tsx");
  assert.match(a11y, /lab-only/);
  assert.match(a11y, /not a CrUX or field Core Web Vitals/);
  assert.match(a11y, /must not be marketed as one without real field data/);
});