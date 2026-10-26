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

test("security page keeps Cyber Essentials PLANNED only", () => {
  assert.match(page, /Cyber Essentials: PLANNED \(target Q2 2027\)/);
  assert.match(page, /Honest Certification Status/);
  assert.match(page, /No ISO 27001, SOC 2/);
  assert.match(page, /bank-grade/i);
  assert.doesNotMatch(page, /Cyber Essentials certified/i);
  assert.doesNotMatch(page, /we hold Cyber Essentials/i);
  assert.doesNotMatch(page, /ISO 27001 certified/i);
  assert.doesNotMatch(page, /SOC 2 (Type (I|II) )?certified/i);
});

test("security page keeps draft legal and no launch-flag sales copy", () => {
  assert.match(page, /DRAFT FOR LEGAL REVIEW/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /99\.9%/);
  assert.doesNotMatch(page, /uptime guarantee/i);
});
