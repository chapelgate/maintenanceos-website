import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/contractor-quotes.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("contractor-quotes does not publish a live quote workflow", () => {
  assert.doesNotMatch(text, /Parts required|Specialist sub-trade|Scope change|Tenant upgrade|Insurance claim/);
  assert.doesNotMatch(text, /Settings →|Reports →/);
  assert.doesNotMatch(text, /budget limit|spend report|approval log/);
  assert.match(text, /not a live quote workflow/i);
  assert.match(text, /not applicable/i);
});

test("contractor-quotes description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
