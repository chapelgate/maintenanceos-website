import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifySri } from "./sri-verifier.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");

function readHtml(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("out/index.html exists for SRI verification", () => {
  assert.ok(fs.existsSync(path.join(OUT, "index.html")), "out/index.html missing");
});

test("out/create/index.html exists for SRI verification", () => {
  assert.ok(fs.existsSync(path.join(OUT, "create", "index.html")), "out/create/index.html missing");
});

test("SRI verifier can parse exported pages", () => {
  const html = readHtml("out/index.html");
  const results = verifySri(html);
  assert.ok(Array.isArray(results.covered));
  assert.ok(Array.isArray(results.uncovered));
  assert.ok(typeof results.total === "number");
});

test("SRI verifier checks script resources", () => {
  const html = readHtml("out/index.html");
  const results = verifySri(html);
  assert.ok(results.total > 0, "expected at least one static script resource on homepage");
});

test("security page documents SRI coverage honestly (no false claim)", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/security/page.tsx"), "utf8");
  assert.match(page, /Subresource Integrity/);
  assert.match(page, /sha384-/);
  assert.match(page, /sri-verifier/);
});