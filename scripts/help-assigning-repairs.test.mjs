import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/assigning-repairs.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("assigning-repairs does not publish a live assignment flow", () => {
  assert.doesNotMatch(text, /\bAssign Contractor\b|\bConfirm Assignment\b|\bBulk Assign\b|\bReassign\b/);
  assert.doesNotMatch(text, /\bSMS\b|\bGas Safe\b|\bpostcode\b/i);
  assert.doesNotMatch(text, /30%|25%|20%|15%|10%/);
  assert.doesNotMatch(text, /24\/7|30 minutes|First-time fix/);
  assert.doesNotMatch(text, /Repairs →|Settings →/);
  assert.doesNotMatch(text, /contractor-quotes|contractor-workload|contractor-performance|emergency-assignment/);
  assert.match(text, /not a live assignment flow/i);
  assert.match(text, /not a live matching rule/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("assigning-repairs description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
