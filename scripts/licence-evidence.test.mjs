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

const LOCK_HASH = "b6b40384eb0034ae70ae32d6df5ab824d34a43641611e272e5f207b4af906d37";
const SOURCE_COMMIT = "ff0140cc8ef7ac48e7fdab2c17d2f8ee4cbd4cbe";

const REUSE_LICENCES = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD"]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function categoryFor(licence) {
  if (REUSE_LICENCES.has(licence)) return "reuse";
  if (/LGPL|GPL|AGPL/i.test(licence)) return "copyleft/unlicensed";
  return "unresolved";
}

function collectLock() {
  const lock = JSON.parse(read("package-lock.json"));
  const packages = lock.packages || {};
  const entries = [];
  for (const [pathKey, value] of Object.entries(packages)) {
    if (pathKey === "") continue;
    entries.push({ path: pathKey, ...value });
  }
  return { lock, entries };
}

const LOCK = collectLock();

function assertNoUndefinedPackageLabels(evidence) {
  assert.doesNotMatch(
    evidence,
    /`undefined`/,
    "evidence must not contain literal `undefined` package labels",
  );
}

function parseEvidenceTable(evidence) {
  const rows = [];
  const lines = evidence.split("\n");
  let inTable = false;
  for (const line of lines) {
    if (line.startsWith("| # | Package name")) {
      inTable = true;
      continue;
    }
    if (inTable) {
      if (!line.startsWith("| ")) break;
      const parts = line.split("|").map(s => s.trim()).filter((_, i) => i > 0 && i < 7);
      if (parts.length >= 5) {
        const [idx, name, version, licence, source, category] = parts;
        if (/^\d+$/.test(idx)) {
          rows.push({ idx: parseInt(idx), name, version, licence, source, category });
        }
      }
    }
  }
  return rows;
}

function parseSourcesMd(sourcesMd) {
  const files = [];
  const lines = sourcesMd.split("\n");
  for (const line of lines) {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|/);
    if (match) {
      files.push(match[1]);
    }
  }
  return files;
}

function bindRowToLock(row) {
  const matches = LOCK.entries.filter(
    (e) => e.path === row.name && e.version === row.version,
  );
  assert.strictEqual(
    matches.length,
    1,
    `evidence row ${row.idx} (${row.name}@${row.version}) must bind to exactly one lock entry, found ${matches.length}`,
  );
  return matches[0];
}

test("licence evidence matches the package lock hash and package versions", () => {
  const actualHash = crypto.createHash("sha256").update(read("package-lock.json")).digest("hex");
  assert.strictEqual(actualHash, LOCK_HASH, "package-lock.json SHA-256 does not match recorded candidate");

  assert.strictEqual(LOCK.lock.name, "maintenanceos-website");
  assert.strictEqual(LOCK.lock.version, "0.1.0");
  assert.strictEqual(LOCK.lock.lockfileVersion, 3);

  const rootDeps = LOCK.lock.packages[""].dependencies || {};
  assert.strictEqual(rootDeps.next, "16.4.3");
  assert.strictEqual(rootDeps.parse5, "7.3.0");
  assert.strictEqual(rootDeps["pdfjs-dist"], "6.3.289");
  assert.strictEqual(rootDeps.react, "19.3.0");
  assert.strictEqual(rootDeps["react-dom"], "19.3.0");

  const sharp = LOCK.entries.find((e) => e.path === "node_modules/sharp");
  assert.ok(sharp, "sharp entry missing from lock");
  assert.strictEqual(sharp.version, "0.35.5");
  assert.strictEqual(sharp.license, "Apache-2.0");

  const next = LOCK.entries.find((e) => e.path === "node_modules/next");
  assert.ok(next, "next entry missing from lock");
  assert.strictEqual(next.version, "16.4.3");

  for (const pkg of ["react", "react-dom", "parse5", "pdfjs-dist"]) {
    assert.ok(LOCK.entries.some((e) => e.path === `node_modules/${pkg}`), `${pkg} entry missing from lock`);
  }

  const evidence = read("docs/THIRD_PARTY_RELEASE_EVIDENCE.md");
  assert.match(evidence, new RegExp(SOURCE_COMMIT));
  assert.match(evidence, new RegExp(LOCK_HASH));

  for (const entry of LOCK.entries) {
    assert.ok(entry.name || entry.path, `lockfile entry missing name/path: ${entry.path}`);
    assert.ok(entry.version, `lockfile entry missing version: ${entry.path}`);
    assert.ok(entry.license, `lockfile entry missing declared licence: ${entry.path}`);
    assert.ok(
      entry.resolved || entry.path.includes("@tailwindcss/oxide-wasm32-wasi/node_modules/"),
      `lockfile entry missing resolved source: ${entry.path}`,
    );
  }

  const evidenceRows = parseEvidenceTable(evidence);
  for (const row of evidenceRows) {
    bindRowToLock(row);
  }
});

test("licence evidence records sharp libvips and shipped media sources", () => {
  const evidence = read("docs/THIRD_PARTY_RELEASE_EVIDENCE.md");

  assert.match(evidence, /sharp/);
  assert.match(evidence, /libvips/);
  assert.match(evidence, /@img\/sharp-libvips-linux-x64/);
  assert.match(evidence, /LGPL-3\.0-or-later/);
  assert.match(evidence, /opencollective\.com\/libvips/);

  const sources = read("public/media/home/SOURCES.md");
  const mediaFiles = parseSourcesMd(sources);
  assert.ok(mediaFiles.length > 0, "SOURCES.md must contain at least one media file");

  for (const file of mediaFiles) {
    assert.match(sources, new RegExp(file, "i"), `SOURCES.md must reference ${file}`);
    assert.match(evidence, new RegExp(file, "i"), `evidence must reference ${file}`);
    assert.ok(
      fs.existsSync(path.join(ROOT, "public/media/home", file)),
      `missing shipped media file: ${file}`
    );
  }
  assert.ok(fs.existsSync(path.join(ROOT, "public/media/home/SOURCES.md")), "missing SOURCES.md");

  const sharpEntries = LOCK.entries.filter((e) => /sharp|libvips/.test(e.path));
  for (const entry of sharpEntries) {
    assert.match(evidence, new RegExp(escapeRegex(entry.path)));
  }
});

test("licence evidence fails closed on unresolved obligations", () => {
  const evidence = read("docs/THIRD_PARTY_RELEASE_EVIDENCE.md");

  assertNoUndefinedPackageLabels(evidence);

  assert.doesNotMatch(evidence, /LGPL[^.]*\b(?:is|are|being|has been|was)\s+cleared\b/i);
  assert.doesNotMatch(evidence, /sharp[^.]*\b(?:is|are|being|has been|was)\s+cleared\b/i);
  assert.match(evidence, /unresolved/);
  assert.match(evidence, /not described as legally cleared/);

  const evidenceRows = parseEvidenceTable(evidence);

  for (const row of evidenceRows) {
    const lockEntry = bindRowToLock(row);

    assert.strictEqual(
      row.licence,
      lockEntry.license,
      `evidence row ${row.idx} (${row.name}) declared licence ${row.licence} disagrees with lock licence ${lockEntry.license}`,
    );

    const expectedCategory = categoryFor(lockEntry.license);
    assert.strictEqual(
      row.category,
      expectedCategory,
      `evidence row ${row.idx} (${row.name}) category ${row.category} expected ${expectedCategory} for licence ${lockEntry.license}`,
    );
  }

  const evidenceNames = new Set(evidenceRows.map((r) => r.name));
  const missingEvidence = LOCK.entries.filter((e) => !evidenceNames.has(e.path));
  assert.strictEqual(
    missingEvidence.length,
    0,
    `lockfile packages missing from evidence: ${missingEvidence.map((e) => e.path).join(", ")}`,
  );

  assert.match(evidence, /proprietary contract-only licence/);
});