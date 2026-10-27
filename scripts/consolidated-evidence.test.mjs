import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

test("npm test script covers all scripts test files (no self-run recursion)", () => {
  const testScript = pkg.scripts.test;
  assert.match(testScript, /scripts\/\*\.test\.mjs/);
  assert.doesNotMatch(testScript, /consolidated-evidence\.test\.mjs/);
});

test("lint script present", () => {
  assert.equal(pkg.scripts.lint, "eslint");
});

test("release marker exists with honesty fields for this HEAD", () => {
  const release = path.join(ROOT, "public/release.json");
  const marker = JSON.parse(fs.readFileSync(release, "utf8"));
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim().toLowerCase();
  assert.equal(marker.commit, head);
  assert.equal(marker.public_launch, false);
  assert.equal(marker.commercial_ga, false);
  assert.equal(marker.live_phone, false);
});

test("candidate-evidence + health-artifact + rollback-evidence scripts exist", () => {
  assert.ok(fs.existsSync(path.join(ROOT, "scripts/write-candidate-evidence.mjs")));
  assert.ok(fs.existsSync(path.join(ROOT, "scripts/write-health-artifact.mjs")));
  assert.ok(fs.existsSync(path.join(ROOT, "scripts/write-rollback-evidence.mjs")));
});

test("gitleaks ignore absent (no hide)", () => {
  assert.ok(!fs.existsSync(path.join(ROOT, ".gitleaksignore")));
});

test("package exposes consolidated:evidence script", () => {
  assert.equal(
    pkg.scripts["consolidated:evidence"],
    "node scripts/consolidated-evidence.test.mjs",
  );
});
