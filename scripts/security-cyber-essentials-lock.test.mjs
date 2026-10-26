import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/security/page.tsx"),
  "utf8",
);
const trust = fs.readFileSync(
  path.join(ROOT, "src/app/trust/page.tsx"),
  "utf8",
);

test("security page keeps Cyber Essentials PLANNED only without invented target quarter", () => {
  assert.match(page, /Cyber Essentials: PLANNED \(not held\)/);
  assert.match(page, /Honest Certification Status/);
  assert.match(page, /No ISO 27001, SOC 2, or bank-grade claims/);
  assert.doesNotMatch(page, /or No bank-grade/);
  assert.doesNotMatch(page, /Cyber Essentials certified/i);
  assert.doesNotMatch(page, /we hold Cyber Essentials/i);
  assert.doesNotMatch(page, /ISO 27001 certified/i);
  assert.doesNotMatch(page, /SOC 2 (Type (I|II) )?certified/i);
  assert.doesNotMatch(page, /target Q2 2027/i);
  assert.doesNotMatch(page, /Q2 2027/);
});

test("trust page keeps Cyber Essentials PLANNED only without invented target quarter", () => {
  assert.match(trust, /Cyber Essentials \(PLANNED — not held\)/);
  assert.doesNotMatch(trust, /Q2 2027/);
  assert.doesNotMatch(trust, /target Q\d/i);
  assert.doesNotMatch(trust, /Cyber Essentials certified/i);
});

test("security page keeps draft legal and no launch-flag sales copy", () => {
  assert.match(page, /DRAFT FOR LEGAL REVIEW/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /99\.9%/);
  assert.doesNotMatch(page, /uptime guarantee/i);
});

test("security page does not claim static-host clickjacking headers are resolved", () => {
  assert.match(page, /not claimed as resolved on the current static host/);
  assert.match(page, /frame-ancestors/);
  assert.match(page, /does not change deploy or\s+nginx configuration/);
  assert.doesNotMatch(page, /clickjacking (is |risk is )?resolved/i);
  assert.doesNotMatch(page, /X-Frame-Options: DENY/);
});
