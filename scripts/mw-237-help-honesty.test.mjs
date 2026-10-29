import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("help index page has content page metadata", () => {
  const page = read("src/app/help/page.tsx");
  assert.ok(page.includes("generateMetadata"));
  assert.ok(page.includes('generateHelpIndexMetadata'));
  assert.ok(page.includes('contentPageMetadata'));
});

test("help index page has PageHero with documentation description", () => {
  const page = read("src/app/help/page.tsx");
  assert.match(page, /Searchable documentation/);
  assert.match(page, /26 articles/);
  assert.match(page, /Searchable documentation for MaintenanceOS/);
});

test("help index page has JsonLd metadata", () => {
  const page = read("src/app/help/page.tsx");
  assert.ok(page.includes("JsonLd data"));
  assert.ok(page.includes("generateHelpIndexMetadata"));
});

test("help index page has FunnelPathStrip", () => {
  const page = read("src/app/help/page.tsx");
  assert.match(page, /FunnelPathStrip/);
});

test("help index page has search functionality", () => {
  const page = read("src/app/help/page.tsx");
  assert.match(page, /help-search/);
  assert.match(page, /Search Help Articles/);
  assert.match(page, /data-search-text/);
});

test("help index page has CTA pair", () => {
  const page = read("src/app/help/page.tsx");
  assert.match(page, /CtaPair/);
});