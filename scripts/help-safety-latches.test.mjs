import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/safety-latches.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("safety-latches does not publish a live safety hold", () => {
  assert.doesNotMatch(text, /Gas Safety|Homes \(Fitness|Electricity at Work|Building Regulations/);
  assert.doesNotMatch(text, /Fire Safety Order|Control of Asbestos|ACOP L8|HSG274/);
  assert.doesNotMatch(text, /Gas Safe|NICEIC|SMS|RAAC/);
  assert.doesNotMatch(text, /4 hours|30 minutes|2 hours|24-hour/);
  assert.doesNotMatch(text, /Reports →|Settings →|Clear Hold/);
  assert.doesNotMatch(text, /safety-officers|emergency-spend|compliance-reports/);
  assert.match(text, /not a live safety latch/i);
  assert.match(text, /not a live hold/i);
  assert.match(text, /not a live rule set/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("safety-latches description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
