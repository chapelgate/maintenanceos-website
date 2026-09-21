import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("conversation-benchmark npm scripts point at the scripted runner", () => {
  const root = JSON.parse(read("package.json"));
  const pkg = JSON.parse(read("packages/sandbox-test-call/package.json"));
  assert.equal(
    root.scripts["conversation-benchmark"],
    "node --experimental-strip-types packages/sandbox-test-call/src/conversation-benchmark.ts",
  );
  assert.equal(
    pkg.scripts["conversation-benchmark"],
    "node --experimental-strip-types src/conversation-benchmark.ts",
  );
});

test("conversation-benchmark docs name the CLI and stay scripted-only", () => {
  const doc = read("docs/testing/conversation-benchmark.md");
  assert.match(doc, /npm run conversation-benchmark/);
  assert.match(doc, /packages\/sandbox-test-call\/src\/conversation-benchmark\.ts/);
  assert.match(doc, /emergency-999/);
  assert.match(doc, /not on file/);
  assert.match(doc, /UK 999/);
  assert.match(doc, /not 911/);
  assert.doesNotMatch(doc, /live call succeeded/i);
  assert.match(doc, /not a live phone call/i);
  assert.match(doc, /Live-call parity still open/);
});

test("next.config static export is unchanged by the conversation benchmark", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});
