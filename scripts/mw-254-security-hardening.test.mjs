import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("security page has honest no certifications claim", () => {
  const page = read("src/app/security/page.tsx");
  assert.ok(page.includes('No certifications claimed'));
  assert.ok(page.includes('pre-launch'));
  assert.ok(page.includes('Pre-launch'));
});

test("security page has PageHero with honest lede", () => {
  const page = read("src/app/security/page.tsx");
  assert.ok(page.includes('PageHero'));
  assert.ok(page.includes('Not a live production guarantee'));
  assert.ok(page.includes('Tenant isolation'));
});

test("security page has BentoCard with cyber essentials planned", () => {
  const page = read("src/app/security/page.tsx");
  assert.ok(page.includes('Cyber Essentials'));
  assert.ok(page.includes('PLANNED (not held)'));
  assert.ok(page.includes('BentoCard'));
});

test("security page has CtaPair with demo and vulnerability disclosure", () => {
  const page = read("src/app/security/page.tsx");
  assert.ok(page.includes('Request an early demo'));
  assert.ok(page.includes('Vulnerability disclosure'));
  assert.ok(page.includes('CtaPair'));
});

test("security page has subprocessors reference", () => {
  const page = read("src/app/security/page.tsx");
  assert.ok(page.includes('/subprocessors/'));
  assert.ok(page.includes('subprocessor page'));
  assert.ok(page.includes('not a live operations console'));
});