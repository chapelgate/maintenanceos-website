import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("mw-193: CSP meta is present in layout", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /httpEquiv="Content-Security-Policy"/);
});

test("mw-193: security headers module defines X-Frame-Options DENY", () => {
  const mod = read("src/lib/static-security-headers.ts");
  assert.match(mod, /"X-Frame-Options": "DENY"/);
});

test("mw-193: security headers module defines nosniff", () => {
  const mod = read("src/lib/static-security-headers.ts");
  assert.match(mod, /"X-Content-Type-Options": "nosniff"/);
});

test("mw-193: security baseline doc is honest about static export header limits", () => {
  const doc = read("docs/security/static-security-baseline.md");
  assert.match(doc, /cannot emit|App Platform static|not arbitrary/i);
});
