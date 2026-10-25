import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/epc-compliance.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("epc-compliance does not publish a live compliance tool", () => {
  assert.doesNotMatch(text, /1 Apr 2018|1 Apr 2020|Minimum Rating|Domestic new lets/);
  assert.doesNotMatch(text, /Reports →|Property →|Settings →/);
  assert.doesNotMatch(text, /Auto-warning|Overdue alert|MEES exemption/i);
  assert.match(text, /not a live compliance tool/i);
  assert.match(text, /not a live tracker/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("epc-compliance description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
