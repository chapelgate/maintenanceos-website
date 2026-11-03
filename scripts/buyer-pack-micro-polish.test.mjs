import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("buyer note does not publish price or certify verification", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("buyer note cross-references Andy synthetic demo steps and locks", () => {
  const andyDoc = read("docs/demo/ANDY_SYNTHETIC_DEMO.md");
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /Andy synthetic demo/);
  assert.match(andyDoc, /pre-launch, synthetic only/);
  assert.match(andyDoc, /Do not set NEXT_PUBLIC_PUBLIC_LAUNCH to true/);
  assert.match(andyDoc, /Do not call the golden phone line/);
  assert.match(andyDoc, /Do not enter a live customer record/);
});

test("buyer note does not sell or offer checkout", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /Not a checkout/);
  assert.doesNotMatch(page, /complete a purchase/i);
  assert.match(page, /does not start a contract/i);
  assert.match(page, /index: false/);
});

test("buyer note has honest publisher info without live claims", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /Chapelgate Limited, company number 12340004/);
  assert.match(page, /Not a live phone line/);
  assert.match(page, /Not a claim that WCAG 2\.2 AA has been verified/);
});