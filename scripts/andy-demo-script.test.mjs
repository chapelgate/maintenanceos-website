import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const doc = fs.readFileSync(
  path.join(ROOT, "docs/demo/ANDY_SYNTHETIC_DEMO.md"),
  "utf8",
);

test("Andy demo script stays a pre-launch synthetic walkthrough", () => {
  assert.match(doc, /pre-launch, synthetic only/);
  assert.match(doc, /Do not set NEXT_PUBLIC_PUBLIC_LAUNCH to true/);
  assert.match(doc, /Do not call the golden phone line/);
  assert.match(doc, /Do not enter a live customer record/);
  assert.match(doc, /not a live telephone call/);
  assert.match(doc, /no list price is published/);
  assert.match(doc, /no uptime percentage/);
  assert.match(doc, /WCAG 2\.2 AA is verified/);
});

test("Andy demo script does not instruct a sale or a public launch", () => {
  assert.doesNotMatch(doc, /£/);
  assert.doesNotMatch(doc, /buy now/i);
  assert.doesNotMatch(doc, /set NEXT_PUBLIC_PUBLIC_LAUNCH=true/);
  assert.doesNotMatch(doc, /merge/i);
});

test("Andy demo script covers accessibility, security.txt, disclosure, and buyers pack", () => {
  assert.match(doc, /\/accessibility\//);
  assert.match(doc, /not field Core Web Vitals/);
  assert.match(doc, /\/\.well-known\/security\.txt/);
  assert.match(doc, /\/vulnerability-disclosure\//);
  assert.match(doc, /\/buyers\//);
  assert.match(doc, /not an offer for sale/);
  assert.match(doc, /not a WCAG 2\.2 AA verification claim/);
});
