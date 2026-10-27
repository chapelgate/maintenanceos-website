import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(ROOT, "scripts/write-rollback-evidence.mjs");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const rollback = fs.readFileSync(path.join(ROOT, "scripts/rollback-plan.mjs"), "utf8");

test("package exposes rollback:evidence script", () => {
  assert.equal(
    pkg.scripts["rollback:evidence"],
    "node scripts/write-rollback-evidence.mjs",
  );
});

test("local rollback evidence records SHA without executing revert", () => {
  const out = path.join(os.tmpdir(), `mw-rollback-evidence-${process.pid}.json`);
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ROLLBACK_EVIDENCE_PATH: out },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const evidence = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(evidence.schema, 1);
  assert.equal(evidence.kind, "local-rollback-evidence");
  assert.equal(evidence.network, false);
  assert.equal(evidence.executed, false);
  assert.equal(evidence.strategy, "git-revert-preserve-history");
  assert.match(evidence.head, /^[0-9a-f]{7,40}$/);
  assert.equal(evidence.checks.revertOnly, true);
  assert.equal(evidence.checks.forbidsHardResetOnSharedMain, true);
  assert.equal(evidence.ok, true);
  assert.deepEqual(evidence.failures, []);
  assert.ok(evidence.bans.some((b) => /does not run git revert/i.test(b)));
  assert.doesNotMatch(JSON.stringify(evidence), /0151\s*321\s*1920/);
  assert.ok(evidence.bans.some((b) => /force-push main/i.test(b)));
  assert.equal(evidence.checks.forbidsForcePushMain, true);
  fs.unlinkSync(out);
});

test("rollback plan stays revert-only", () => {
  assert.match(rollback, /git revert --no-edit/);
  assert.match(rollback, /git reset --hard on shared main/);
  assert.doesNotMatch(rollback, /execFileSync\("git", \["reset", "--hard"/);
});
