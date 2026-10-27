import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const writer = fs.readFileSync(
  path.join(ROOT, "scripts/write-secret-scan-evidence.mjs"),
  "utf8",
);

test("package exposes secret-scan:evidence script", () => {
  assert.equal(
    pkg.scripts["secret-scan:evidence"],
    "node scripts/write-secret-scan-evidence.mjs",
  );
  assert.match(writer, /local-secret-scan-evidence/);
  assert.match(writer, /executedScan: false/);
  assert.match(writer, /forbidsGitleaksIgnoreHide/);
});

test("secret-scan evidence is SHA-bound and ok", () => {
  const out = path.join(os.tmpdir(), `mw-131-secret-${process.pid}.json`);
  try {
    const stdout = execFileSync(
      process.execPath,
      ["scripts/write-secret-scan-evidence.mjs"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, SECRET_SCAN_EVIDENCE_PATH: out },
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
    assert.equal(evidence.network, false);
    assert.equal(evidence.executedScan, false);
    assert.equal(evidence.head, head);
    assert.equal(evidence.checks.secretScanScriptPresent, true);
    assert.equal(evidence.checks.secretScanInNpmTest, true);
    assert.equal(evidence.checks.forbidsGitleaksIgnoreHide, true);
    assert.deepEqual(evidence.failures, []);
    assert.equal(fs.existsSync(out), true);
  } finally {
    try { fs.unlinkSync(out); } catch {}
  }
});
