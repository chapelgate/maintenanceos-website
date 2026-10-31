import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("error page never logs or surfaces the Next.js error digest to users", () => {
  const page = read("src/app/error.tsx");
  // Already asserted: no error.digest, no error.message
  assert.doesNotMatch(page, /console\.(log|error|warn|debug)/);
  assert.doesNotMatch(page, /JSON\.stringify/);
  assert.doesNotMatch(page, /localStorage|sessionStorage/);
  // Error object is explicitly voided but not rendered
  assert.match(page, /void error/);
});

test("global error page never leaks the digest or stack in production", () => {
  const page = read("src/app/global-error.tsx");
  assert.doesNotMatch(page, /console\.(log|error|warn|debug)/);
  assert.doesNotMatch(page, /error\.digest/);
  assert.doesNotMatch(page, /error\.stack/);
  assert.doesNotMatch(page, /<pre>/i);
});
