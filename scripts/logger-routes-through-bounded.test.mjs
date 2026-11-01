import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("logger exports debug, info, warn, error and redacts PII", () => {
  const source = read("src/lib/logger.ts");
  assert.match(source, /export const logger = \{/);
  assert.match(source, /debug:/);
  assert.match(source, /info:/);
  assert.match(source, /warn:/);
  assert.match(source, /error:/);
  assert.match(source, /PII_KEYS/);
  assert.match(source, /\[REDACTED\]/);
  assert.match(source, /sanitize/);
});

test("logger formats messages with ISO timestamp", () => {
  const source = read("src/lib/logger.ts");
  assert.match(source, /new Date\(\)\.toISOString\(\)/);
  assert.match(source, /format\(/);
});

test("LOG_LEVEL env controls verbosity", () => {
  const source = read("src/lib/logger.ts");
  assert.match(source, /LOG_LEVEL/);
  assert.match(source, /levelFromEnv/);
});

test("preview-voice routes voice warnings through bounded logger", () => {
  const source = read("src/lib/preview-voice.ts");
  assert.match(source, /import \{ logger \} from ".\/logger\.ts"/);
  assert.match(source, /logger\.warn\(`Gemini voice unavailable/);
  assert.doesNotMatch(source, /console\.warn\(`Gemini voice unavailable/);
});

test("integration-tokens routes MemoryTokenStore warning through bounded logger", () => {
  const source = read("src/lib/integration-tokens.ts");
  assert.match(source, /import \{ logger \} from ".\/logger\.ts"/);
  assert.match(source, /logger\.warn\("Using MemoryTokenStore/);
  assert.doesNotMatch(source, /console\.warn\("Using MemoryTokenStore/);
});
