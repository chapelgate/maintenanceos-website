import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonLd = fs.readFileSync(path.join(ROOT, "src/lib/json-ld.ts"), "utf8");

test("JSON-LD names the publisher and stays pre-launch", () => {
  assert.match(jsonLd, /Chapelgate Technologies/);
  assert.match(jsonLd, /WorkSmartOS/);
  assert.match(jsonLd, /MaintenanceOS/);
  assert.match(jsonLd, /Not commercially generally available/);
  assert.match(jsonLd, /not a public always-on phone service/);
  assert.match(jsonLd, /priceSpecification:\s*null/);
  assert.match(jsonLd, /https:\/\/schema\.org\/PreOrder/);
  assert.doesNotMatch(jsonLd, /WCAG 2\.2 AA verified/);
  assert.doesNotMatch(jsonLd, /£/);
  assert.doesNotMatch(jsonLd, /buy now/i);
});
