import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

test("next is patched past the 16.3.x advisory window", () => {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  assert.strictEqual(pkg.dependencies.next, "16.4.3");
  assert.strictEqual(lock.packages["node_modules/next"].version, "16.4.3");
});

test("zod override pins a patched 4.6.7 release", () => {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  assert.strictEqual(pkg.overrides.zod, "4.6.7");
  assert.strictEqual(lock.packages["node_modules/zod"].version, "4.6.7");
});

test("security review records the 2026-10-31 dependency patch", () => {
  const review = fs.readFileSync(
    path.join(ROOT, "WEBSITE_SECURITY_REVIEW.md"),
    "utf8",
  );
  assert.match(review, /16\.4\.3/);
  assert.match(review, /zod overridden to \*\*4\.6\.7\*\*/);
  assert.match(review, /critical\/high cleared/i);
  assert.doesNotMatch(review, /0 known vulnerabilities at\s+2026-09-27/);
});
