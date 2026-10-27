import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/buyers/page.tsx"), "utf8");
const andyDoc = fs.readFileSync(
  path.join(ROOT, "docs/demo/ANDY_SYNTHETIC_DEMO.md"),
  "utf8",
);

test("buyers page stays a synthetic pre-launch demo note", () => {
  assert.match(page, /Pre-launch buyer note for the synthetic demo/);
  assert.match(page, /synthetic demo of MaintenanceOS/);
  assert.match(page, /not an offer for sale/i);
  assert.match(page, /does not start a contract/i);
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
});

test("buyers page denies live phone WCAG-verified and public launch", () => {
  assert.match(page, /Not a live phone line/);
  assert.match(page, /not public launch/i);
  assert.match(page, /Not a claim that WCAG 2\.2 AA has been verified/);
  assert.match(page, /does not publish a list price/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /£/);
});

test("buyers page cross-references Andy demo steps and locks", () => {
  assert.match(page, /Andy synthetic demo/);
  assert.match(page, /Andy synthetic demo walkthrough/);
  assert.match(andyDoc, /pre-launch, synthetic only/);
  assert.match(andyDoc, /Do not set NEXT_PUBLIC_PUBLIC_LAUNCH to true/);
  assert.match(andyDoc, /Do not call the golden phone line/);
  assert.match(andyDoc, /Do not enter a live customer record/);
});