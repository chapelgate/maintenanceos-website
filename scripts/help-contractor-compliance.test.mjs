import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/contractor-compliance.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("contractor-compliance does not publish a live compliance scheme", () => {
  assert.doesNotMatch(text, /Gas Safe|NICEIC|ELECSA|OFTEC|F-Gas|IPAF|PASMA|TrustMark/);
  assert.doesNotMatch(text, /HSE register|Building Safety Act|DBS/);
  assert.doesNotMatch(text, /£\d/);
  assert.doesNotMatch(text, /SMS/);
  assert.doesNotMatch(text, /Settings →/);
  assert.doesNotMatch(text, /Reports →/);
  assert.doesNotMatch(text, /gas-safe-api|insurance-minimums|compliance-audit|subcontractor-compliance/);
  assert.doesNotMatch(text, /30 days before|7 days before|Employers' Liability/);
  assert.match(text, /not a live compliance scheme/i);
  assert.match(text, /not a live tracking scheme/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("contractor-compliance description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
