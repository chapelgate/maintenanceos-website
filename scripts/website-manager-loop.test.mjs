import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (p) => fs.readFileSync(p, "utf8");

test("Website Manager composes existing controls instead of duplicating them", () => {
  const pkg = JSON.parse(read("package.json"));
  const src = read("scripts/website-manager-loop.mjs");
  assert.equal(pkg.scripts["manager:monitor"], "node scripts/website-manager-loop.mjs monitor");
  assert.equal(pkg.scripts["manager:preflight"], "node scripts/website-manager-loop.mjs preflight");
  assert.equal(pkg.scripts["manager:verify"], "node scripts/website-manager-loop.mjs verify");
  assert.equal(pkg.scripts["manager:record"], "node scripts/website-manager-loop.mjs record");
  assert.match(src, /website-health-monitor\.mjs/);
  assert.match(src, /seo-live-monitor\.mjs/);
  assert.match(src, /release:preflight/);
  assert.match(src, /release:verify/);
});

test("detect phase requires repair instead of mutating a failing site blindly", () => {
  const src = read("scripts/website-manager-loop.mjs");
  assert.match(src, /repair_required/);
  assert.match(src, /smallest evidence-backed repair/);
  assert.match(src, /rerun manager:monitor/);
  assert.doesNotMatch(src, /git\s+reset\s+--hard/);
  assert.doesNotMatch(src, /git\s+push.*--force/);
  assert.doesNotMatch(src, /digitalocean.*deploy/i);
});

test("record phase requires monitor preflight and deployment verification", () => {
  const src = read("scripts/website-manager-loop.mjs");
  assert.match(src, /monitor not healthy/);
  assert.match(src, /preflight not passed/);
  assert.match(src, /deployment not verified/);
  assert.match(src, /gh/);
  assert.match(src, /pr", "comment/);
  assert.match(src, /latest-record\.json/);
});

test("Website Manager state is ignored and runbook defines the full loop", () => {
  const ignore = read(".gitignore");
  const doc = read("docs/STEP50_WEBSITE_MANAGER_LOOP.md");
  assert.match(ignore, /\.website-manager\//);
  assert.match(doc, /monitor.*detect.*repair.*test.*deploy.*verify.*record/is);
  assert.match(doc, /PR.*main/is);
  assert.match(doc, /smallest.*repair/is);
  assert.match(doc, /do not repair a healthy site/i);
  assert.match(doc, /durable.*PR comment/is);
});
