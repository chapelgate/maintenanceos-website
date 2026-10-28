import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

test("package exposes consolidated:evidence script", () => {
  assert.equal(
    pkg.scripts["consolidated:evidence"],
    "node scripts/write-consolidated-evidence.mjs",
  );
});

test("consolidated evidence aggregates SHA-bound local artifacts", () => {
  const out = path.join(os.tmpdir(), `mw-135-consol-${process.pid}.json`);
  try {
    const stdout = execFileSync(
      process.execPath,
      ["scripts/write-consolidated-evidence.mjs"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, CONSOLIDATED_EVIDENCE_PATH: out },
      },
    );
    const evidence = JSON.parse(stdout);
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    })
      .trim()
      .toLowerCase();
    assert.equal(evidence.ok, true);
    assert.equal(evidence.kind, "local-consolidated-evidence");
    assert.equal(evidence.network, false);
    assert.equal(evidence.head, head);
    assert.equal(evidence.checks.candidateOk, true);
    assert.equal(evidence.checks.secretScanOk, true);
    assert.equal(evidence.checks.rollbackOk, true);
    assert.equal(evidence.checks.healthOk, true);
    assert.equal(evidence.checks.releaseMarkerDeniesLaunch, true);
    assert.deepEqual(evidence.failures, []);
    assert.equal(fs.existsSync(out), true);
  } finally {
    try { fs.unlinkSync(out); } catch {}
  }
});

test("consolidated evidence all parts SHA-bound to same HEAD", () => {
  const out = path.join(os.tmpdir(), `mw-consol-sha-${process.pid}.json`);
  try {
    const stdout = execFileSync(
      process.execPath,
      ["scripts/write-consolidated-evidence.mjs"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, CONSOLIDATED_EVIDENCE_PATH: out },
      },
    );
    const evidence = JSON.parse(stdout);
    assert.equal(evidence.parts.candidate.head, evidence.head);
    assert.equal(evidence.parts.secretScan.head, evidence.head);
    assert.equal(evidence.parts.rollback.head, evidence.head);
    assert.equal(evidence.parts.health.head, evidence.head);
    assert.deepEqual(evidence.failures, []);
  } finally {
    try { fs.unlinkSync(out); } catch {}
  }
});
