import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("integration-tokens imports logger and warns on MemoryTokenStore in production", () => {
  const source = read("src/lib/integration-tokens.ts");
  assert.match(source, /import \{ logger \} from ".\/logger\.ts"/);
  assert.match(source, /logger\.warn\("Using MemoryTokenStore/);
  assert.doesNotMatch(source, /console\.warn\("Using MemoryTokenStore/);
});

test("integration-tokens never uses console.warn directly", () => {
  const source = read("src/lib/integration-tokens.ts");
  assert.doesNotMatch(source, /console\.warn\(/);
  assert.doesNotMatch(source, /console\.error\(/);
  assert.doesNotMatch(source, /console\.log\(/);
});

test("integration-tokens uses logger for production store warning", () => {
  const source = read("src/lib/integration-tokens.ts");
  assert.match(source, /logger\.warn\("Using MemoryTokenStore in non-test environment/);
});
