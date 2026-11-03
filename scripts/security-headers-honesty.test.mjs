import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("security page documents missing HTTP response headers honestly", () => {
  const page = read("src/app/security/page.tsx");
  assert.match(page, /X-Frame-Options/);
  assert.match(page, /frame-ancestors/);
  assert.match(page, /not claimed as resolved/);
  assert.match(page, /current static host/);
});

test("security page does not claim certification or production deployment", () => {
  const page = read("src/app/security/page.tsx");
  assert.doesNotMatch(page, /Cyber Essentials: (certified|held|achieved)/i);
  assert.match(page, /Cyber Essentials: PLANNED \(not held\)/);
  assert.doesNotMatch(page, /production deployment/i);
});

test("security page does not claim live phone or uptime guarantees", () => {
  const page = read("src/app/security/page.tsx");
  assert.doesNotMatch(page, /0151\s*321\s*1920/);
  assert.doesNotMatch(page, /uptime guarantee/);
  assert.doesNotMatch(page, /live release guarantee/);
});

test("security baseline doc describes header limits honestly", () => {
  const doc = read("docs/security/static-security-baseline.md");
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /App Platform/);
  assert.match(doc, /cannot emit them today/);
  assert.match(doc, /frame-ancestors/);
  assert.match(doc, /Do not claim/);
});

test("security headers are not faked in HTML meta", () => {
  const layout = read("src/app/layout.tsx");
  const csp = read("src/lib/static-security-headers.ts");
  assert.match(layout, /httpEquiv=["']Content-Security-Policy["']/);
  assert.doesNotMatch(layout, /X-Frame-Options/);
  assert.doesNotMatch(layout, /X-Content-Type-Options/);
  assert.match(csp, /X-Frame-Options.*DENY/);
  assert.match(csp, /frame-ancestors 'none'/);
});
