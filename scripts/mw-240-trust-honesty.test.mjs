import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("trust page has content page metadata", () => {
  const page = read("src/app/trust/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('title: "Trust & Verification"'));
  assert.ok(page.includes('path: "/trust/"'));
});

test("trust page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Trust/);
  assert.match(page, /Pre-launch/);
  assert.match(page, /No invented claims/);
});

test("trust page has Companies House section", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Chapelgate Limited/);
  assert.match(page, /12340004/);
  assert.match(page, /Companies House register/);
});

test("trust page has DPIA section with honest status", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /DPIA is in progress/);
  assert.match(page, /before general availability/);
  assert.match(page, /no DPIA sign-off is claimed/i);
});

test("trust page has call recording disclosure", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Call Recording/);
  assert.match(page, /voice demo/);
  assert.match(page, /Demo recordings are not stored/);
  assert.match(page, /explicit consent/);
});

test("trust page has certification status with honest no-claim", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Certification Status/);
  assert.match(page, /We do not hold and do not claim/);
  assert.match(page, /ISO 27001/);
  assert.match(page, /SOC 2/);
  assert.match(page, /Cyber Essentials/);
  assert.match(page, /bank-grade/);
});

test("trust page has pre-launch status section", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Pre-Launch Status/);
  assert.match(page, /pre-launch/);
  assert.match(page, /DRAFT FOR LEGAL\s+REVIEW/);
});

test("trust page has voice demo section", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Voice Demo/);
  assert.match(page, /Browser sandbox/);
  assert.match(page, /Preview demo number/);
  assert.match(page, /not a live always-on phone/);
});

test("trust page has related pages references", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /\/security\//);
  assert.match(page, /\/subprocessors\//);
  assert.match(page, /\/vulnerability-disclosure\//);
  assert.match(page, /\/privacy\//);
  assert.match(page, /\/cookies\//);
  assert.match(page, /\/terms\//);
  assert.match(page, /\/accessibility\//);
  assert.match(page, /\/status\//);
});