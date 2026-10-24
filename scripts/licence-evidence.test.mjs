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

const REUSE_LICENCES = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD"]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function entryName(entry) {
  if (entry.name) return entry.name;
  const p = entry.path || "";
  const scoped = p.match(/(@[^/]+\/[^/]+)$/);
  if (scoped) return scoped[1];
  return p.split("/").pop();
}

function entryShortName(entry) {
  const name = entryName(entry);
  return name.split("/").pop();
}

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

test("licence evidence matches the package lock hash and package versions", () => {
  const actualHash = crypto.createHash("sha256").update(read("package-lock.json")).digest("hex");
  assert.strictEqual(actualHash, LOCK_HASH, "package-lock.json SHA-256 does not match recorded candidate");

  assert.strictEqual(LOCK.lock.name, "maintenanceos-website");
  assert.strictEqual(LOCK.lock.version, "0.1.0");
  assert.strictEqual(LOCK.lock.lockfileVersion, 3);

  const rootDeps = LOCK.lock.packages[""].dependencies || {};
  assert.strictEqual(rootDeps.next, "16.3.8");
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
  assert.strictEqual(next.version, "16.3.8");

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

  // Parse evidence table and verify each row's version matches lockfile
  const evidenceRows = parseEvidenceTable(evidence);
  for (const row of evidenceRows) {
    const matches = LOCK.entries.filter(
      (e) => entryName(e) === row.name || entryShortName(e) === row.name || e.path.endsWith(`/node_modules/${row.name}`),
    );
    const versionMatch = matches.find((e) => e.version === row.version);
    if (versionMatch) continue;
    if (matches.length > 0) {
      assert.fail(
        `evidence row version mismatch for ${row.name}: evidence has ${row.version}, lockfile entries have versions: ${matches.map((e) => `${entryName(e)}=${e.version}`).join(", ")}`,
      );
    }
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

  const sharpEntries = LOCK.entries.filter((e) => /sharp|libvips/.test(e.name || e.path.split("/").pop()));
  for (const entry of sharpEntries) {
    assert.match(evidence, new RegExp(escapeRegex(entryName(entry))));
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
    const lic = row.licence || "";
    const category = (row.category || "").toLowerCase();

    // Check if licence is outside reuse list (ISC, LGPL, GPL, AGPL, MPL, etc.)
    const isReuseLicence = REUSE_LICENCES.has(lic);
    const hasCopyleft = /LGPL|GPL|AGPL|MPL/i.test(lic);

    if (!isReuseLicence || hasCopyleft) {
      // Non-reuse licence or copyleft licence must not be categorized as "reuse"
      assert.notStrictEqual(
        category,
        "reuse",
        `package ${row.name} has licence ${lic} but evidence category is "reuse" — must be "unresolved" or similar`
      );
    }

    // ISC specifically must be unresolved
    if (lic === "ISC") {
      assert.strictEqual(
        category,
        "unresolved",
        `ISC package ${row.name} must be categorized as "unresolved", not "${category}"`
      );
    }

    // MPL packages must be unresolved
    if (/MPL/i.test(lic)) {
      assert.match(evidence, new RegExp(escapeRegex(row.name)), `MPL package ${row.name} not recorded in evidence`);
      assert.match(evidence, /unresolved/i, `MPL package ${row.name} not marked unresolved in evidence`);
    }

    // LGPL packages must be unresolved
    if (/LGPL/i.test(lic)) {
      assert.match(evidence, new RegExp(escapeRegex(row.name)), `LGPL package ${row.name} not recorded in evidence`);
      assert.match(evidence, /unresolved|copyleft/i, `LGPL package ${row.name} not marked unresolved in evidence`);
    }
  }

  assert.match(evidence, /proprietary contract-only licence/);
});