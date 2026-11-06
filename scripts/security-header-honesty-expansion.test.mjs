import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const OUT = path.join(ROOT, "out");

function getAllHtmlPages() {
  if (!fs.existsSync(OUT)) return [];
  const htmlFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html") htmlFiles.push(full);
    }
  };
  walk(OUT);
  return htmlFiles;
}

function relPath(page) {
  return page.replace(ROOT + "/", "");
}

// New: exported pages contain CSP meta and referrer policy
test("all exported pages contain CSP meta and referrer policy", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = relPath(page);
    const html = fs.readFileSync(page, "utf8");
    assert.match(html, /http-equiv="Content-Security-Policy"/, `${rel} missing CSP meta`);
    assert.match(html, /name="referrer"/, `${rel} missing referrer policy meta`);
  }
});

// New: CSP meta does not falsely claim frame-ancestors enforcement
test("CSP meta on all pages does not claim frame-ancestors (cannot enforce via meta)", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = relPath(page);
    const html = fs.readFileSync(page, "utf8");
    const cspMatch = html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/);
    if (cspMatch) {
      const csp = cspMatch[1];
      assert.doesNotMatch(csp, /frame-ancestors/, `${rel} CSP meta falsely claims frame-ancestors enforcement`);
    }
  }
});

// New: CSP meta production excludes unsafe-eval
test("CSP meta on all pages excludes unsafe-eval in production", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = relPath(page);
    const html = fs.readFileSync(page, "utf8");
    const cspMatch = html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/);
    if (cspMatch) {
      const csp = cspMatch[1];
      assert.doesNotMatch(csp, /unsafe-eval/, `${rel} CSP meta contains unsafe-eval`);
    }
  }
});

// New: CSP meta includes strict-origin-when-cross-origin referrer
test("CSP meta includes strict-origin-when-cross-origin referrer", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = relPath(page);
    const html = fs.readFileSync(page, "utf8");
    const referrerMatch = html.match(/name="referrer" content="([^"]*)"/);
    if (referrerMatch) {
      const referrer = referrerMatch[1];
      assert.match(referrer, /strict-origin-when-cross-origin/, `${rel} referrer policy not strict-origin-when-cross-origin`);
    }
  }
});

// New: security page documents missing HTTP response headers honestly
test("security page documents X-Frame-Options and frame-ancestors as unresolved", () => {
  const page = read("src/app/security/page.tsx");
  assert.match(page, /X-Frame-Options/);
  assert.match(page, /frame-ancestors/);
  assert.match(page, /not claimed as resolved|current static host|hosting limitation|ignored in HTML meta/);
});

// New: no X-Frame-Options meta tag in exported HTML
test("no X-Frame-Options meta tag in exported HTML", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = relPath(page);
    const html = fs.readFileSync(page, "utf8");
    assert.doesNotMatch(html, /<meta[^>]*X-Frame-Options/, `${rel} contains X-Frame-Options meta tag`);
    assert.doesNotMatch(html, /http-equiv="X-Frame-Options"/, `${rel} contains X-Frame-Options http-equiv meta`);
  }
});

// New: meta CSP structure consistency across pages
test("meta CSP structure consistent across all exported pages", () => {
  const pages = getAllHtmlPages();
  const cspPolicies = new Set();
  for (const page of pages) {
    const rel = relPath(page);
    const html = fs.readFileSync(page, "utf8");
    const cspMatch = html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/);
    if (cspMatch) {
      cspPolicies.add(cspMatch[1]);
    }
  }
  assert.ok(cspPolicies.size <= 2, `CSP policies vary across pages: ${cspPolicies.size} unique policies`);
});

// New: health artifact cross-validates with release + status markers
test("health artifact cross-validates with release and status markers", () => {
  const healthScript = read("scripts/write-health-artifact.mjs");
  assert.match(healthScript, /recordedAt/);
  assert.match(healthScript, /head: head\(\)/);
  assert.match(healthScript, /mode: "offline-config"/);
  assert.match(healthScript, /network: false/);
  assert.match(healthScript, /schema: 1/);
  assert.match(healthScript, /kind: "offline-health-artifact"/);

  const outMarker = readJson("out/release.json");
  assert.match(outMarker.note, /Pre-launch synthetic demo/);
  assert.doesNotMatch(healthScript, /uptime/);
  assert.doesNotMatch(healthScript, /SLA/);
  assert.doesNotMatch(healthScript, /99\.\d%/);
});