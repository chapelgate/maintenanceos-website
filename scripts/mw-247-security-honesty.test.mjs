import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("security page has content page metadata", () => {
  const page = read("src/app/security/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "Security and Data Separation"'));
  assert.ok(page.includes('path: "/security/"'));
  assert.ok(page.includes('No certifications claimed'));
});

test("security page has PageHero with honest lede", () => {
  const page = read("src/app/security/page.tsx");
  assert.match(page, /Tenant isolation/);
  assert.match(page, /zero client-money execution/);
  assert.match(page, /audit trail designed/);
  assert.match(page, /Controls sit in source code/);
  assert.match(page, /Not a live production guarantee/);
});

test("security page has honest no certifications claim", () => {
  const page = read("src/app/security/page.tsx");
  assert.match(page, /No ISO 27001, SOC 2, or bank-grade claims/);
});