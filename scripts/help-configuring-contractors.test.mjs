import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/configuring-contractors.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("configuring-contractors does not publish a live contractor network", () => {
  assert.doesNotMatch(text, /Settings → Contractors/);
  assert.doesNotMatch(text, /Gas Safe|NICEIC|ELECSA/);
  assert.doesNotMatch(text, /2 hours|4 hours|5 days/);
  assert.doesNotMatch(text, /Reports → Contractor Performance/);
  assert.doesNotMatch(text, /company_name/);
  assert.doesNotMatch(text, /En Route/);
  assert.doesNotMatch(text, /First-time fix/);
  assert.doesNotMatch(text, /postcode/i);
  assert.doesNotMatch(text, /assigning-repairs|contractor-quotes|contractor-compliance/);
  assert.doesNotMatch(text, /Plumbing|Electrical|Roofing/);
  assert.match(text, /not a live network/i);
  assert.match(text, /not a live setup/i);
  assert.match(text, /not a live rule set/i);
  assert.match(text, /not a live dashboard/i);
  assert.match(text, /not applicable/i);
});

test("configuring-contractors description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
