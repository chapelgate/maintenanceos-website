import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/gas-safety-compliance.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("gas-safety-compliance does not publish a live compliance tool", () => {
  assert.doesNotMatch(text, /\bGas Safe API\b|\bCP12\b|\bCKR1\b|Immediately Dangerous|\bAt Risk\b/);
  assert.doesNotMatch(text, /60\/30\/7|28 days|2 years|Unlimited fines/);
  assert.doesNotMatch(text, /\bSchedule Check\b|Reports →|Property →/);
  assert.doesNotMatch(text, /gas-safety-scheduling|gas-remedial-repairs|gas-safe-engineers|gas-tenant-comms/);
  assert.match(text, /not a live compliance tool/i);
  assert.match(text, /not a live tracker/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("gas-safety-compliance description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
