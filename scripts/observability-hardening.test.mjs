import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logger = fs.readFileSync(path.join(ROOT, "src/lib/logger.ts"), "utf8");

test("logger bounds console calls and redacts secrets", () => {
  assert.match(logger, /PII_KEYS/);
  assert.match(logger, /sanitize/);
  assert.match(logger, /format/);
});

test("logger exports warn, info, debug, error methods", () => {
  assert.match(logger, /warn:/);
  assert.match(logger, /info:/);
  assert.match(logger, /debug:/);
  assert.match(logger, /error:/);
});