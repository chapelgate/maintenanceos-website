import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("trust page certification section is honest about PLANNED not held", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /Cyber Essentials \(PLANNED — not held\)/);
  assert.doesNotMatch(page, /Q2 2027/);
  assert.doesNotMatch(page, /target Q\d/i);
  assert.match(page, /ISO 27001/);
  assert.match(page, /SOC 2 Type I or Type II/);
  assert.match(page, /ISO 9001/);
  assert.match(page, /PCI DSS/);
  assert.match(page, /HIPAA/);
  assert.match(page, /bank-grade/i);
  assert.doesNotMatch(page, /we hold Cyber Essentials/i);
  assert.doesNotMatch(page, /Cyber Essentials certified/i);
});

test("trust page does not claim launch or general availability", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /pre-launch/);
  assert.match(page, /not\s+commercially\s+generally\s+available/s);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
});

test("trust page DPIA status is in progress not complete", () => {
  const page = read("src/app/trust/page.tsx");
  assert.match(page, /DPIA is in progress/);
  assert.match(page, /completed\s+before\s+general\s+availability/s);
  assert.doesNotMatch(page, /DPIA (complete|finished|approved)/i);
});

test("trust page recording disclosure does not claim live phone", () => {
  const page = read("src/app/trust/page.tsx");
  assert.doesNotMatch(page, /live phone/);
  assert.doesNotMatch(page, /0151\s*321\s*1920/);
});