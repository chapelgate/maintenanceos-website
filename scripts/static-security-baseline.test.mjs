import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("deploy path stays App Platform static export — no invented header hosts", () => {
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
  const pages = ["out/en-GB/index.html", "out/en-GB/create/index.html", "out/en-GB/dashboard/index.html"];
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

test("root layout and metadata apply the HTML-honored baseline", () => {
  const layout = read("src/app/[locale]/layout.tsx");
  const meta = read("src/lib/page-meta.ts");
  assert.match(layout, /contentSecurityPolicy/);
  assert.match(layout, /httpEquiv=["']Content-Security-Policy["']/);
  assert.doesNotMatch(layout, /^["']use client["']/);
  assert.match(meta, /referrer:\s*REFERRER_POLICY/);
  assert.match(meta, /from ["']@\/lib\/static-security-headers["']/);
});

test("operator note is honest about DO static header limits", () => {
  const doc = read("docs/security/static-security-baseline.md");
  const readme = read("README.md");
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /App Platform/);
  assert.match(doc, /\*\*not\*\* arbitrary response headers/);
  assert.match(doc, /http-equiv/);
  assert.match(doc, /strict-origin-when-cross-origin/);
  assert.match(doc, /X-Content-Type-Options/);
  assert.match(doc, /X-Frame-Options/);
  assert.match(doc, /frame-ancestors/);
  assert.match(doc, /cannot emit them today/);
  assert.match(doc, /Do not claim/);
  assert.match(doc, /public\/_headers/);
  assert.match(doc, /headers\(\)/);
  assert.match(doc, /NEXT_PUBLIC_FORM_ENDPOINT/);
  assert.match(readme, /docs\/security\/static-security-baseline\.md/);
});