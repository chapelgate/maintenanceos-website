import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

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

test("static security baseline CSP and referrer hardening", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
  assert.doesNotMatch(config, /^\s*(async\s+)?headers\s*[:(]/m);
  assert.match(config, /static-security-headers/);

  assert.equal(fs.existsSync(path.join(ROOT, "app.yaml")), false);
  assert.equal(fs.existsSync(path.join(ROOT, ".do")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "public/_headers")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "vercel.json")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "netlify.toml")), false);
});

test("exported HTML carries CSP http-equiv and referrer when out/ exists", () => {
  const pages = ["out/index.html", "out/create/index.html", "out/dashboard/index.html"];
  const present = pages.filter((rel) => fs.existsSync(path.join(ROOT, rel)));
  if (present.length === 0) {
    return;
  }
  for (const rel of present) {
    const html = read(rel);
    assert.match(html, /http-equiv="Content-Security-Policy"/);
    assert.match(html, /script-src/);
    assert.match(html, /unsafe-inline/);
    assert.doesNotMatch(html, /unsafe-eval/);
    assert.match(html, /name="referrer" content="strict-origin-when-cross-origin"/);
  }
});
