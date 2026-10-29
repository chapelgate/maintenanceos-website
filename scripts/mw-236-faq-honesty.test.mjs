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
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('title: "FAQ: Safety, Data, Pricing and Status"'));
  assert.ok(page.includes('path: "/faq/"'));
});

test("faq page has PageHero with preview declaration", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /Not a live phone/);
  assert.match(page, /no invented facts/);
  assert.match(page, /no cert theatre/);
});

test("faq page has JsonLd metadata", () => {
  const page = read("src/app/faq/page.tsx");
  assert.ok(page.includes("JsonLd data"));
  assert.ok(page.includes("fullFaqPageJsonLd"));
});

test("faq page has FaqAccordion with faqItems", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /FaqAccordion/);
  assert.match(page, /faqItems/);
});

test("faq page has FunnelPathStrip", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /FunnelPathStrip/);
});

test("faq page has CTA pair", () => {
  const page = read("src/app/faq/page.tsx");
  assert.match(page, /CtaPair/);
});