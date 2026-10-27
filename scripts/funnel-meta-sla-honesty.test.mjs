import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/page-meta.ts"), "utf8");

function descriptions(text) {
  return [...text.matchAll(/description:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
}

test("funnel and industries meta descriptions deny phone and SLA", () => {
  const descs = descriptions(src);
  assert.ok(descs.length >= 7, `expected ≥7 descriptions, got ${descs.length}`);
  for (const d of descs) {
    assert.ok(d.length <= 160, `description length ${d.length}: ${d}`);
    assert.match(d, /pre-launch|not general availability/i);
    assert.match(d, /not a live phone|no phone number|not always-on/i);
    assert.match(d, /no SLA claim/i);
    assert.doesNotMatch(d, /SLA guaranteed/i);
  }
  assert.match(src, /not always-on/);
  assert.match(src, /not general availability/);
});
