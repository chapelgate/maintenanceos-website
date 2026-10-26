import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const post = fs.readFileSync(
  path.join(ROOT, "src/content/blog/structured-repair-intake-vs-free-text-forms.mdx"),
  "utf8",
);

test("structured-repair blog does not imply published response SLAs", () => {
  assert.match(post, /mapped to urgency grades for human review/);
  assert.match(post, /not a published response SLA/);
  assert.doesNotMatch(post, /mapped to response SLAs/);
  assert.doesNotMatch(post, /24\/7 always/i);
  assert.doesNotMatch(post, /commercially generally available/i);
});
