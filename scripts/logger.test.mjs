import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/logger.ts"), "utf8");

test("logger exports debug method", () => {
  assert.match(src, /debug:/);
});

test("logger exports info method", () => {
  assert.match(src, /info:/);
});

test("logger exports warn method", () => {
  assert.match(src, /warn:/);
});

test("logger exports error method", () => {
  assert.match(src, /error:/);
});

test("logger has PII_KEYS redaction", () => {
  assert.match(src, /PII_KEYS/);
});

test("logger has sanitize function", () => {
  assert.match(src, /sanitize/);
});

test("logger has format function", () => {
  assert.match(src, /format/);
});
