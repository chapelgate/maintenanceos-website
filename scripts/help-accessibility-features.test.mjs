import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/accessibility-features.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("accessibility-features does not publish live portal a11y claims", () => {
  assert.doesNotMatch(text, /Alt\+[1-5]/);
  assert.doesNotMatch(text, /Full Cymraeg translation/i);
  assert.doesNotMatch(text, /Voice input/);
  assert.doesNotMatch(text, /axe-core.*every PR/i);
  assert.doesNotMatch(text, /Lighthouse CI.*≥\s*95/i);
  assert.doesNotMatch(text, /Settings →|Reports →/);
  assert.doesNotMatch(text, /WCAG 2\.2 Level AA/);
  assert.match(text, /not a verified WCAG claim/i);
  assert.match(text, /not applicable/i);
});

test("accessibility-features description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
