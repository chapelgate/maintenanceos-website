import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(ROOT, "scripts/write-candidate-evidence.mjs");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

test("package exposes candidate:evidence script", () => {
  assert.equal(pkg.scripts["candidate:evidence"], "node scripts/write-candidate-evidence.mjs");
});

test("local candidate evidence records HEAD and required policy checks", () => {
  const out = path.join(os.tmpdir(), `mw-candidate-evidence-${process.pid}.json`);
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, CANDIDATE_EVIDENCE_PATH: out },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const evidence = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(evidence.schema, 1);
  assert.equal(evidence.kind, "local-candidate-evidence");
  assert.match(evidence.head, /^[0-9a-f]{7,40}$/);
  assert.equal(evidence.ok, true);
  assert.equal(evidence.checks.secretScanScriptPresent, true);
  assert.equal(evidence.checks.rollbackRevertOnly, true);
  assert.equal(evidence.checks.healthMonitorOptInControlPlane, true);
  assert.equal(evidence.checks.healthMonitorNoRailwayDefault, true);
  assert.equal(evidence.checks.publicLaunchFailClosed, true);
  assert.ok(evidence.bans.some((b) => /Does not deploy/.test(b)));
  assert.ok(evidence.bans.some((b) => /PUBLIC_LAUNCH/.test(b)));
  assert.doesNotMatch(JSON.stringify(evidence), /0151\s*321\s*1920/);
  fs.unlinkSync(out);
});
