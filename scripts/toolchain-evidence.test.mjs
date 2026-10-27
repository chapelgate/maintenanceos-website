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
  path.join(ROOT, "scripts/write-toolchain-evidence.mjs"),
  "utf8",
);

test("package exposes toolchain:evidence and typecheck scripts", () => {
  assert.equal(
    pkg.scripts["toolchain:evidence"],
    "node scripts/write-toolchain-evidence.mjs",
  );
  assert.match(pkg.scripts.typecheck, /tsc/);
  assert.equal(pkg.scripts.lint, "eslint");
  assert.match(writer, /local-toolchain-evidence/);
  assert.match(writer, /executedLint: false/);
  assert.match(writer, /executedTypecheck: false/);
});

test("toolchain evidence is SHA-bound and ok", () => {
  const out = path.join(os.tmpdir(), `mw-132-toolchain-${process.pid}.json`);
  try {
    const stdout = execFileSync(
      process.execPath,
      ["scripts/write-toolchain-evidence.mjs"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, TOOLCHAIN_EVIDENCE_PATH: out },
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
    assert.equal(evidence.executedLint, false);
    assert.equal(evidence.executedTypecheck, false);
    assert.equal(evidence.head, head);
    assert.equal(evidence.checks.lintScriptIsEslint, true);
    assert.equal(evidence.checks.typecheckScriptPresent, true);
    assert.equal(evidence.checks.tscBinaryPresentWhenInstalled, true);
    assert.equal(evidence.checks.tsconfigPresent, true);
    assert.deepEqual(evidence.failures, []);
    assert.equal(fs.existsSync(out), true);
  } finally {
    try { fs.unlinkSync(out); } catch {}
  }
});
