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

test("buyer note stays a noindex pre-launch pack", () => {
  assert.match(page, /synthetic demo of MaintenanceOS/);
  assert.match(page, /not an offer for sale/);
  assert.match(page, /does not publish a list price/);
  assert.match(page, /does not show an uptime figure/);
  assert.match(page, /Not a live phone line/);
  assert.match(page, /Not a claim that WCAG 2\.2 AA has been verified/);
  assert.match(page, /Chapelgate Limited, company number 12340004/);
  assert.match(page, /index: false/);
});

test("buyer note inspects pack links and denies live claims", () => {
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/onboarding\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /scanner remains frozen/);
  assert.match(page, /not a live support desk/);
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /Chapelgate Technologies/);
});

test("buyer note does not sell or certify", () => {
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA verified/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /Chapelgate Technologies/);
});

test("buyers page stays a synthetic pre-launch demo note per ANDY doc", () => {
  assert.match(page, /Pre-launch buyer note for the synthetic demo/);
  assert.match(page, /synthetic demo of MaintenanceOS/);
  assert.match(page, /not an offer for sale/i);
  assert.match(page, /does not start a contract/i);
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
  assert.match(andyDoc, /pre-launch, synthetic only/);
  assert.match(andyDoc, /Do not set NEXT_PUBLIC_PUBLIC_LAUNCH to true/);
  assert.match(andyDoc, /Do not call the golden phone line/);
  assert.match(andyDoc, /Do not enter a live customer record/);
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
