import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/trust/page.tsx"), "utf8");

test("trust page denies holding listed certifications", () => {
  assert.match(page, /We do not hold and do not claim any of the following certifications/i);
  assert.match(page, /ISO 27001/);
  assert.match(page, /SOC 2 Type I or Type II/);
  assert.match(page, /Cyber Essentials \(PLANNED/);
  assert.match(page, /ISO 9001/);
  assert.match(page, /PCI DSS/);
  assert.match(page, /HIPAA/);
  assert.match(page, /bank-grade/i);
  assert.doesNotMatch(page, /ISO 27001 certified/i);
  assert.doesNotMatch(page, /SOC 2 (Type (I|II) )?certified/i);
  assert.doesNotMatch(page, /Cyber Essentials certified/i);
  assert.doesNotMatch(page, /we hold Cyber Essentials/i);
});

test("trust page keeps pre-launch and no launch-flag sales copy", () => {
  assert.match(page, /pre-launch/i);
  assert.match(page, /not\s+commercially generally available/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
});
