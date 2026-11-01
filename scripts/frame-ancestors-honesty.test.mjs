import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const doc = fs.readFileSync(path.join(ROOT, "docs/security/static-security-baseline.md"), "utf8");
const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");

test("clickjacking protection is an honest documented gap on DO static export", () => {
  assert.match(doc, /frame-ancestors/);
  assert.match(doc, /cannot emit them today/);
  assert.match(doc, /`frame-ancestors` is ignored in HTML meta CSP/);
});

test("no HTTP response header path is invented for frame-ancestors", () => {
  assert.doesNotMatch(config, /^\s*(async\s+)?headers\s*[:(]/m);
  assert.equal(fs.existsSync(path.join(ROOT, "app.yaml")), false);
  assert.equal(fs.existsSync(path.join(ROOT, ".do")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "public/_headers")), false);
});

test("HTML CSP meta does not claim frame-ancestors (meta CSP ignores it)", () => {
  assert.doesNotMatch(layout, /frame-ancestors/);
});
