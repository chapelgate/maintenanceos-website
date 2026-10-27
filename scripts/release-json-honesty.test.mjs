import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const writer = fs.readFileSync(
  path.join(ROOT, "scripts/write-release-marker.mjs"),
  "utf8",
);

test("release marker source denies launch, GA, and live phone", () => {
  assert.match(writer, /public_launch:\s*false/);
  assert.match(writer, /commercial_ga:\s*false/);
  assert.match(writer, /live_phone:\s*false/);
  assert.match(writer, /Pre-launch synthetic demo release marker/);
  assert.match(writer, /Chapelgate Limited/);
  assert.match(writer, /12340004/);
  assert.doesNotMatch(writer, /public_launch:\s*true/);
  assert.doesNotMatch(writer, /commercial_ga:\s*true/);
  assert.doesNotMatch(writer, /live_phone:\s*true/);
});

test("write-release-marker emits honesty fields for HEAD", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mw-129-release-"));
  const publicDir = path.join(tmp, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const script = path.join(tmp, "write-release-marker.mjs");
  // Run from a temp copy that writes into tmp/public by rewriting cwd layout
  fs.copyFileSync(path.join(ROOT, "scripts/write-release-marker.mjs"), script);
  // Execute from ROOT so git rev-parse works; redirect by monkeypatching via env not available,
  // so invoke in ROOT and read public/release.json then restore.
  const target = path.join(ROOT, "public/release.json");
  const prior = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  try {
    execFileSync(process.execPath, ["scripts/write-release-marker.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const marker = JSON.parse(fs.readFileSync(target, "utf8"));
    assert.equal(marker.schema, 1);
    assert.equal(marker.public_launch, false);
    assert.equal(marker.commercial_ga, false);
    assert.equal(marker.live_phone, false);
    assert.equal(marker.publisher, "Chapelgate Limited");
    assert.equal(marker.company_number, "12340004");
    assert.match(marker.commit, /^[0-9a-f]{7,40}$/i);
    assert.match(marker.note, /Not commercially generally available/);
    assert.doesNotMatch(JSON.stringify(marker), /99\.\d%/);
  } finally {
    if (prior === null) {
      try { fs.unlinkSync(target); } catch {}
    } else {
      fs.writeFileSync(target, prior);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
