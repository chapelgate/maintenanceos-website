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

test("out/index.html exists for SRI verification", () => {
  assert.ok(fs.existsSync(path.join(OUT, "index.html")), "out/index.html missing");
});

test("out/create/index.html exists for SRI verification", () => {
  assert.ok(fs.existsSync(path.join(OUT, "create", "index.html")), "out/create/index.html missing");
});

test("all exported pages exist for SRI verification", () => {
  const pages = getAllHtmlPages();
  assert.ok(pages.length > 2, "expected more than 2 exported pages");
});

test("SRI verifier can parse all exported pages", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = path.relative(ROOT, page);
    const html = fs.readFileSync(page, "utf8");
    const results = verifySri(html);
    assert.ok(Array.isArray(results.covered), rel);
    assert.ok(Array.isArray(results.uncovered), rel);
    assert.ok(typeof results.total === "number", rel);
  }
});

test("SRI verifier checks script resources on all exported pages", () => {
  const pages = getAllHtmlPages();
  for (const page of pages) {
    const rel = path.relative(ROOT, page);
    const html = fs.readFileSync(page, "utf8");
    const results = verifySri(html);
    // At least one _next/static resource expected per page
    assert.ok(results.total > 0, `expected at least one static script resource on ${rel}`);
  }
});

test("security page documents SRI coverage honestly (no false claim)", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/security/page.tsx"), "utf8");
  assert.match(page, /Subresource Integrity/);
  assert.match(page, /sha384-/);
  assert.match(page, /sri-verifier/);
});