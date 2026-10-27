import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/config/industries.ts"), "utf8");

test("industry role metaDescription denies phone and SLA", () => {
  const descs = [...src.matchAll(/metaDescription:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(descs.length, 8);
  for (const d of descs) {
    assert.ok(d.length <= 160, `${d.length}: ${d}`);
    assert.match(d, /pre-launch/i);
    assert.match(d, /not a live phone|not always-on/i);
    assert.match(d, /no SLA claim/i);
    assert.doesNotMatch(d, /SLA guaranteed/i);
  }
});
