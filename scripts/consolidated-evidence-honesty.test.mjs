import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "scripts/write-consolidated-evidence.mjs"), "utf8");

test("consolidated evidence writer includes all required parts", () => {
  assert.match(src, /candidate:evidence/);
  assert.match(src, /secret-scan:evidence/);
  assert.match(src, /rollback:evidence/);
  assert.match(src, /health:artifact/);
  assert.match(src, /write-release-marker/);
});

test("consolidated evidence writer includes release marker bans", () => {
  assert.match(src, /public_launch/);
  assert.match(src, /commercial_ga/);
  assert.match(src, /live_phone/);
});
