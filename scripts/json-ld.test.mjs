import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/json-ld.ts"), "utf8");

test("json-ld exports marketingJsonLd", () => {
  assert.match(src, /marketingJsonLd/);
});

test("json-ld exports funnelPageJsonLd", () => {
  assert.match(src, /funnelPageJsonLd/);
});

test("json-ld exports fullFunnelPageJsonLd", () => {
  assert.match(src, /fullFunnelPageJsonLd/);
});

test("json-ld exports contentPageJsonLd", () => {
  assert.match(src, /contentPageJsonLd/);
});

test("json-ld exports fullFaqPageJsonLd", () => {
  assert.match(src, /fullFaqPageJsonLd/);
});

test("json-ld exports industryPageJsonLd", () => {
  assert.match(src, /industryPageJsonLd/);
});

test("json-ld exports faqPageJsonLd", () => {
  assert.match(src, /faqPageJsonLd/);
});

test("json-ld exports pricingPageProductJsonLd", () => {
  assert.match(src, /pricingPageProductJsonLd/);
});

test("json-ld softwareApplicationNode denies telephone ratings reviews offers", () => {
  assert.match(src, /SoftwareApplication/);
  assert.match(src, /Not commercially generally available/);
});
