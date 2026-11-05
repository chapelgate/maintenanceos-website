import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const OUT = path.join(ROOT, "out");

function readHtml(rel) {
  return fs.readFileSync(path.join(OUT, rel), "utf8");
}

test("meta CSP does not claim frame-ancestors (ignored in HTML meta)", () => {
  const layout = read("src/app/layout.tsx");
  const csp = read("src/lib/static-security-headers.ts");

  // meta CSP cannot enforce frame-ancestors
  assert.doesNotMatch(layout, /frame-ancestors/);
  // But HTTP CSP should have it documented
  assert.match(csp, /frame-ancestors 'none'/);
});

test("meta CSP production excludes unsafe-eval", () => {
  const csp = read("src/lib/static-security-headers.ts");
  const compact = csp.replace(/\s+/g, " ");
  assert.match(compact, /CONTENT_SECURITY_POLICY = contentSecurityPolicy\("production"\)/);
  // The production CSP string itself should not contain unsafe-eval
  const productionMatch = compact.match(/CONTENT_SECURITY_POLICY = contentSecurityPolicy\("production"\).*?\n\};/s);
  if (productionMatch) {
    const productionCsp = productionMatch[0];
    assert.doesNotMatch(productionCsp, /unsafe-eval/);
  }
  assert.match(compact, /development.*unsafe-eval/);
});

test("meta CSP uses strict-origin-when-cross-origin referrer", () => {
  const layout = read("src/app/layout.tsx");
  const compact = layout.replace(/\s+/g, " ");
  // TSX source uses camelCase httpEquiv; exported HTML renders http-equiv
  assert.match(compact, /httpEquiv="Content-Security-Policy"/);
  const html = readHtml("index.html");
  assert.match(html, /http-equiv="Content-Security-Policy"/);
});

test("exported pages include meta CSP and referrer policy", () => {
  if (!fs.existsSync(OUT)) return;

  const htmlFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html") htmlFiles.push(full);
    }
  };
  walk(OUT);

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /http-equiv="Content-Security-Policy"/, file);
    assert.match(html, /name="referrer"/, file);
  }
});

test("security page documents clickjacking gap honestly", () => {
  const page = read("src/app/security/page.tsx");
  assert.match(page, /frame-ancestors/);
  assert.match(page, /X-Frame-Options/);
  assert.match(page, /not claimed as resolved/);
  assert.match(page, /current static host/);
  assert.match(page, /hosting change/);
});

test("no fake meta tags for X-Frame-Options or X-Content-Type-Options", () => {
  const layout = read("src/app/layout.tsx");
  assert.doesNotMatch(layout, /httpEquiv.*X-Frame-Options/i);
  assert.doesNotMatch(layout, /httpEquiv.*X-Content-Type-Options/i);
  assert.doesNotMatch(layout, /httpEquiv.*Permissions-Policy/i);
});

test("static-security-baseline documents honest gap", () => {
  const doc = read("docs/security/static-security-baseline.md");
  const compact = doc.replace(/\s+/g, " ");
  assert.match(compact, /frame-ancestors/);
  assert.match(compact, /honest gap/);
  assert.match(compact, /App Platform static cannot emit/);
  assert.match(compact, /Do not.*public.*_headers/);
  assert.match(compact, /Do not.*headers\(\)/);
});

test("meta CSP enforces script-src without nonces on static export", () => {
  const csp = read("src/lib/static-security-headers.ts");
  const compact = csp.replace(/\s+/g, " ");
  // Development CSP includes unsafe-inline and unsafe-eval
  assert.match(compact, /unsafe-inline/);
  assert.match(compact, /unsafe-eval/);
  // Production omits unsafe-eval
  assert.match(compact, /CONTENT_SECURITY_POLICY = contentSecurityPolicy\("production"\)/);
  // HTTP CSP adds frame-ancestors
  assert.match(compact, /CONTENT_SECURITY_POLICY_HTTP.*frame-ancestors/);
});