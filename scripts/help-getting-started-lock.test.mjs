import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const text = fs.readFileSync(
  path.join(ROOT, "src/content/help/getting-started.mdx"),
  "utf8",
);

test("getting-started honesty may deny unpublished test repairs without publishing them", () => {
  assert.match(text, /test repairs are not published/i);
  assert.match(text, /No test repair submission/);
  assert.doesNotMatch(text, /Run a Test Repair/);
  assert.doesNotMatch(text, /submit a test repair/i);
  assert.doesNotMatch(text, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
