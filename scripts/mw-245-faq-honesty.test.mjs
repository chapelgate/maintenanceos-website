import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("faq page has content page metadata", () => {
  const page = read("src/app/faq/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "FAQ: Safety, Data, Pricing and Status"'));
  assert.ok(page.includes('path: "/faq/"'));
  assert.ok(page.includes('What the AI will and'));
});

test("faq page has PageHero with honest lede", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /preview follows/);
  assert.match(page, /Not a live phone, no invented facts/);
  assert.match(page, /no cert theatre/);
});

test("faq page has faq accordion items", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /FaqAccordion items/);
  assert.match(page, /items={faqItems}/);
});

test("faq page has cta pair", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /CtaPair/);
});

test("faq page has full faq page json-ld", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /fullFaqPageJsonLd/);
});