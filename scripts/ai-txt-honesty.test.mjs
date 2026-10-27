import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ai = fs.readFileSync(
  path.join(ROOT, "public/.well-known/ai.txt"),
  "utf8",
);

test("ai.txt honesty markers align with release/status denials", () => {
  assert.match(ai, /public_launch:\s*false/);
  assert.match(ai, /commercial_ga:\s*false/);
  assert.match(ai, /live_phone:\s*false/);
  assert.match(ai, /sla_claim:\s*false/);
  assert.match(ai, /\/release\.json/);
  assert.match(ai, /\/status\.json/);
  assert.match(ai, /Not commercially generally available/i);
  assert.match(ai, /Not a public always-on phone line/i);
});
