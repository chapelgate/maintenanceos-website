import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("compare index page has content page metadata", () => {
  const page = read("src/app/compare/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "Compare Alternatives"'));
  assert.ok(page.includes('path: "/compare/"'));
  assert.ok(page.includes('Verifiable facts only'));
});

test("compare index page has PageHero with honest lede", () => {
  const page = read("src/app/compare/page.tsx");
  assert.match(page, /Comparison/);
  assert.match(page, /Side-by-side comparisons with verifiable facts/);
  assert.match(page, /No invented metrics/);
  assert.match(page, /Every competitor claim is sourced/);
});

test("compare index page uses comparison data", () => {
  const page = read("src/app/compare/page.tsx");
  assert.match(page, /getAllComparisonSlugs/);
  assert.match(page, /getComparisonBySlug/);
  assert.match(page, /frontmatter.slug/);
  assert.match(page, /frontmatter.category/);
  assert.match(page, /frontmatter.competitorName/);
  assert.match(page, /frontmatter.tagline/);
});

test("compare index page has methodology section", () => {
  const page = read("src/app/compare/page.tsx");
  assert.match(page, /Our comparison methodology/);
  assert.match(page, /Verifiable claims only/);
  assert.match(page, /No invented data/);
  assert.match(page, /WorkSmartOS claims reflect pre-launch status/);
  assert.match(page, /Claims-safe language/);
  assert.match(page, /Sources cited/);
});

test("compare index page has disclaimer", () => {
  const page = read("src/app/compare/page.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /Informational purposes only/);
  assert.match(page, /not an offer to sell/);
  assert.match(page, /Chapelgate Limited/);
  assert.match(page, /12340004/);
});