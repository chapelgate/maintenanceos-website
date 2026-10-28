import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// Directories skipped because they contain dependencies, build output, or
// generated artefacts rather than reviewed project source.
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "out",
  "coverage",
  "playwright-report",
  "test-results",
]);
const FILE_RE = /\.(?:ts|tsx|js|mjs|cjs|json|md|txt|yml|yaml|html|css|env|example)$/;
const PATTERNS = [
  new RegExp("AKIA" + "[0-9A-Z]{16}"),
  new RegExp(
    "-----BEGIN " + "(?:RSA |OPENSSH |EC |DSA )?" + "PRIVATE KEY-----",
  ),
  new RegExp("sk_live_" + "[0-9A-Za-z]{16,}"),
  new RegExp("sk_test_" + "[0-9A-Za-z]{16,}"),
  new RegExp("pk_live_" + "[0-9A-Za-z]{16,}"),
  new RegExp("pk_test_" + "[0-9A-Za-z]{16,}"),
  new RegExp("ghp_" + "[A-Za-z0-9]{20,}"),
  new RegExp("github_pat_" + "[A-Za-z0-9_]{20,}"),
  new RegExp("xox[baprs]-" + "[A-Za-z0-9-]{10,}"),
  new RegExp("AIza" + "[0-9A-Za-z\\-_]{35}"),
  new RegExp("vercel_" + "[0-9A-Za-z]{20,}"),
  new RegExp("DATABASE_URL" + ".*" + "postgres://[^ ]*:[^ ]*@"),
  new RegExp("mongodb" + "+srv?://[^ ]*:[^ ]*@"),
];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (FILE_RE.test(entry.name)) acc.push(full);
  }
  return acc;
}

test("tracked source has no common live secret patterns", () => {
  const hits = [];
  for (const file of walk(ROOT)) {
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of PATTERNS) {
      if (pattern.test(text)) {
        hits.push(`${path.relative(ROOT, file)} matches ${pattern}`);
      }
    }
  }
  assert.deepEqual(hits, []);
});

test("the captured homepage fixture no longer stores a Google client key", () => {
  const fixture = fs.readFileSync(
    path.join(
      ROOT,
      "packages/onboarding-ingest/src/fixtures/croftautomotive-home.html",
    ),
    "utf8",
  );
  assert.match(fixture, /REDACTED_FIXTURE_GOOGLE_API/);
  assert.doesNotMatch(fixture, /AIza[0-9A-Za-z\-_]{35}/);
});

test("no NEXT_PUBLIC_ secrets in src/", () => {
  const srcRoot = path.join(ROOT, "src");
  const files = fs.readdirSync(srcRoot, { recursive: true });
  const tsFiles = files.filter(
    (f) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".mjs"),
  );
  const patternHits = [];
  for (const f of tsFiles) {
    const text = fs.readFileSync(path.join(srcRoot, f), "utf8");
    // Only flag actual secret assignments like NEXT_PUBLIC_SECRET=actualvalue or NEXT_PUBLIC_KEY=actualvalue
    if (/NEXT_PUBLIC_SECRET\s*=\s*[^"'\\\n\s]+/.test(text) || /NEXT_PUBLIC_KEY\s*=\s*[^"'\\\n\s]+/.test(text)) {
      patternHits.push(path.relative(ROOT, f));
    }
  }
  assert.deepEqual(patternHits, []);
});
