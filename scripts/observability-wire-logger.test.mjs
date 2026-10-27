import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("preview-voice routes warnings through the bounded logger", () => {
  const source = read("src/lib/preview-voice.ts");
  assert.match(source, /import \{ logger \} from ".\/logger\.ts"/);
  assert.match(source, /logger\.warn\(`Gemini voice unavailable/);
  assert.doesNotMatch(source, /console\.warn\(`Gemini voice unavailable/);
});

test("integration-tokens routes warnings through the bounded logger", () => {
  const source = read("src/lib/integration-tokens.ts");
  assert.match(source, /import \{ logger \} from ".\/logger\.ts"/);
  assert.match(source, /logger\.warn\("Using MemoryTokenStore/);
  assert.doesNotMatch(source, /console\.warn\("Using MemoryTokenStore/);
});
