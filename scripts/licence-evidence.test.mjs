import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const LOCK_HASH = "f6305aadc0ba7493c2cb3b5bb6d46e263e1c995028eef04cb85fa8282c864d31";
const SOURCE_COMMIT = "c4ff3ca3c85d296e557897949c58f2608e29e27b";

const COPYLEFT_OR_UNKNOWN = /^(LGPL|GPL|AGPL|BSL)$|source-available|\(none\)/;

function collectLock() {
  const lock = JSON.parse(read("package-lock.json"));
  const packages = lock.packages || {};
  const entries = [];
  for (const [key, value] of Object.entries(packages)) {
    if (key === "") continue;
    entries.push({ path: key, ...value });
  }
  return { lock, entries };
}

const LOCK = collectLock();

test("licence evidence matches the package lock hash and package versions", () => {
  const actualHash = crypto.createHash("sha256").update(read("package-lock.json")).digest("hex");
  assert.strictEqual(actualHash, LOCK_HASH, "package-lock.json SHA-256 does not match recorded candidate");

  assert.strictEqual(LOCK.lock.name, "maintenanceos-website");
  assert.strictEqual(LOCK.lock.version, "0.1.0");
  assert.strictEqual(LOCK.lock.lockfileVersion, 3);

  // Root package resolves its declared dependency versions exactly.
  const rootDeps = LOCK.lock.packages[""].dependencies || {};
  assert.strictEqual(rootDeps.next, "16.3.8");
  assert.strictEqual(rootDeps.parse5, "7.3.0");
  assert.strictEqual(rootDeps["pdfjs-dist"], "6.3.289");
  assert.strictEqual(rootDeps.react, "19.3.0");
  assert.strictEqual(rootDeps["react-dom"], "19.3.0");

  // Resolved exact versions in the lock.
  const sharp = LOCK.entries.find((e) => e.path === "node_modules/sharp");
  assert.ok(sharp, "sharp entry missing from lock");
  assert.strictEqual(sharp.version, "0.35.5");
  assert.strictEqual(sharp.license, "Apache-2.0");

  const next = LOCK.entries.find((e) => e.path === "node_modules/next");
  assert.ok(next, "next entry missing from lock");
  assert.strictEqual(next.version, "16.3.8");

  assert.ok(LOCK.entries.some((e) => e.path === "node_modules/react"));
  assert.ok(LOCK.entries.some((e) => e.path === "node_modules/react-dom"));
  assert.ok(LOCK.entries.some((e) => e.path === "node_modules/parse5"));
  assert.ok(LOCK.entries.some((e) => e.path === "node_modules/pdfjs-dist"));

  // Evidence names the exact source commit.
  const evidence = read("docs/THIRD_PARTY_RELEASE_EVIDENCE.md");
  assert.match(evidence, new RegExp(SOURCE_COMMIT));
  assert.match(evidence, new RegExp(LOCK_HASH));
});

test("licence evidence records sharp libvips and shipped media sources", () => {
  const evidence = read("docs/THIRD_PARTY_RELEASE_EVIDENCE.md");

  // Sharp + libvips platform packages recorded explicitly.
  assert.match(evidence, /sharp/);
  assert.match(evidence, /libvips/);
  assert.match(evidence, /@img\/sharp-libvips-linux-x64/);
  assert.match(evidence, /LGPL-3\.0-or-later/);

  // libvips declared licence metadata preserved.
  assert.match(evidence, /opencollective\.com\/libvips/);

  // Shipped media sources from SOURCES.md preserved.
  const sources = read("public/media/home/SOURCES.md");
  for (const file of ["office-phone.webp", "site-trade.webp", "uk-row.webp"]) {
    assert.match(sources, new RegExp(file, "i"));
    assert.match(evidence, new RegExp(file, "i"));
  }
  assert.match(evidence, /Pexels License/);
  assert.match(evidence, /Unsplash License/);

  // Every referenced shipped file exists on disk.
  for (const file of ["office-phone.webp", "site-trade.webp", "uk-row.webp"]) {
    assert.ok(fs.existsSync(path.join(ROOT, "public/media/home", file)), `missing shipped media file: ${file}`);
  }
  assert.ok(fs.existsSync(path.join(ROOT, "public/media/home/SOURCES.md")), "missing SOURCES.md");
});

test("licence evidence fails closed on unresolved obligations", () => {
  const evidence = read("docs/THIRD_PARTY_RELEASE_EVIDENCE.md");

  // No copyleft / source-available / unlicensed obligation may be described as cleared (affirmative claim only).
  assert.doesNotMatch(evidence, /LGPL[^.]*\b(?:is|are|being|has been|was)\s+cleared\b/i);
  assert.doesNotMatch(evidence, /sharp[^.]*\b(?:is|are|being|has been|was)\s+cleared\b/i);

  // Unresolved obligations are explicitly marked unresolved.
  assert.match(evidence, /unresolved/);
  assert.match(evidence, /not described as legally cleared/);

  // Every lockfile package carries a declared licence; any copyleft entry must be flagged unresolved, never cleared.
  const { entries } = LOCK;
  for (const entry of entries) {
    const lic = entry.license || "";
    if (COPYLEFT_OR_UNKNOWN.test(lic)) {
      const name = entry.path.replace(/^node_modules\//, "");
      assert.match(evidence, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `copyleft package ${name} not recorded in evidence`);
    }
  }

  // The evidence doc must not claim the proprietary site licence is replaced.
  assert.match(evidence, /proprietary contract-only licence/);
});
