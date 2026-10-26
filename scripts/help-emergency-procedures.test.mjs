import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/emergency-procedures.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("emergency-procedures does not publish a live safety tool", () => {
  assert.doesNotMatch(text, /Dedicated 24\/7 support desk/);
  assert.doesNotMatch(text, /24\/7 availability/);
  assert.doesNotMatch(text, /Settings →|Reports →/);
  assert.doesNotMatch(text, /Select qualified emergency contractor/i);
  assert.doesNotMatch(text, /Photos mandatory for emergency/i);
  assert.match(text, /not a live safety tool/i);
  assert.match(text, /not a live support desk/i);
  assert.match(text, /no dedicated 24\/7 support desk/i);
  assert.match(text, /0800 111 999/);
  assert.match(text, /999/);
  assert.match(text, /not applicable/i);
});

test("emergency-procedures description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
