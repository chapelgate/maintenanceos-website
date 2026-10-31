import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("preview-voice imports logger and uses logger.warn for voice unavailability", () => {
  const source = read("src/lib/preview-voice.ts");
  assert.match(source, /import \{ logger \} from ".\/logger\.ts"/);
  assert.match(source, /logger\.warn\(`Gemini voice unavailable/);
  assert.doesNotMatch(source, /console\.warn\(`Gemini voice unavailable/);
});

test("preview-voice uses warnVoice helper for all warnings", () => {
  const source = read("src/lib/preview-voice.ts");
  assert.match(source, /function warnVoice\(reason: string\): void/);
  assert.match(source, /warnVoice\("not_configured"\)/);
  assert.match(source, /warnVoice\("rate_limited"\)/);
});

test("preview-voice never uses console.warn directly", () => {
  const source = read("src/lib/preview-voice.ts");
  assert.doesNotMatch(source, /console\.warn\(/);
});
