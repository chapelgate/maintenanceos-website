import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/release-notes.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("release-notes does not publish a live changelog", () => {
  assert.doesNotMatch(text, /v0\.\d+\.\d+|Released 202[4-9]/);
  assert.doesNotMatch(text, /Gas Safe API|Face ID|Touch ID|Cymraeg/);
  assert.doesNotMatch(text, /Settings →|\/blog\/rss|#maintenanceos-releases/);
  assert.doesNotMatch(text, /6 months notice|12 months notice/);
  assert.doesNotMatch(text, /\.\/changelog|\.\/roadmap|\.\/beta-program|\.\/api-versioning/);
  assert.match(text, /not a live changelog/i);
  assert.match(text, /not a live release/i);
  assert.match(text, /not a live subscribe path/i);
  assert.match(text, /not applicable/i);
});

test("release-notes description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
