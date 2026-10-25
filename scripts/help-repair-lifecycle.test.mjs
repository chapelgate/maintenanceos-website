import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/repair-lifecycle.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("repair-lifecycle does not publish a live repair workflow", () => {
  assert.doesNotMatch(text, /Typical Duration|< 1 hour|< 4 hours|< 24 hours|7 days/);
  assert.doesNotMatch(text, /En Route|Needs Parts|Who Can Set/);
  assert.doesNotMatch(text, /Reports →|Settings →/);
  assert.match(text, /not a live repair workflow/i);
  assert.match(text, /not a live status model/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("repair-lifecycle description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
