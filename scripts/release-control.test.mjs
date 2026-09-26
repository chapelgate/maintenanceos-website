import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (p) => fs.readFileSync(p, "utf8");

test("release preflight requires clean source and runs all local quality gates", () => {
  const pkg = JSON.parse(read("package.json"));
  const src = read("scripts/release-preflight.mjs");
  assert.equal(pkg.scripts["release:preflight"], "node scripts/release-preflight.mjs");
  assert.equal(pkg.scripts["release:verify"], "node scripts/deployment-verifier.mjs");
  assert.match(src, /git", \["status", "--porcelain"\]/);
  assert.match(src, /npm_execpath/);
  assert.match(src, /\[npmCli, "run", "lint"\]/);
  assert.match(src, /\[npmCli, "test"\]/);
  assert.match(src, /\[npmCli, "run", "build"\]/);
  assert.match(src, /performance:budget/);
  assert.match(src, /accessibility:check/);
  assert.match(src, /release\.json/);
  assert.match(src, /does not match HEAD/);
});

test("rollback tooling is revert-only and cannot rewrite shared history", () => {
  const pkg = JSON.parse(read("package.json"));
  const src = read("scripts/rollback-plan.mjs");
  assert.equal(pkg.scripts["rollback:plan"], "node scripts/rollback-plan.mjs");
  assert.match(src, /git revert --no-edit/);
  assert.match(src, /release:preflight/);
  assert.match(src, /deployment:verify/);
  assert.doesNotMatch(src, /reset --hard.*exec|push.*--force.*exec/);
  assert.match(src, /force-push main/);
});

test("release runbook keeps website rollback isolated from product runtime", () => {
  const doc = read("docs/STEP49_RELEASE_ROLLBACK.md");
  assert.match(doc, /PR.*main/i);
  assert.match(doc, /revert/i);
  assert.match(doc, /never force-push/i);
  assert.match(doc, /release\.json/);
  assert.match(doc, /voice.*backend/i);
});
