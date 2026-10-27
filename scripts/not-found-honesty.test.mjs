import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/not-found.tsx"), "utf8");

test("not-found page stays noindex and denies commerce", () => {
  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.match(page, /pre-launch synthetic demo/i);
  assert.match(page, /does not publish a price/);
  assert.match(page, /live phone number/);
  assert.match(page, /connect a\s+calendar/);
  assert.match(page, /deliver chat/);
  assert.doesNotMatch(page, /99\.\d%/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /generally available phone/i);
});

test("not-found keeps safe recovery links", () => {
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/demo\/"/);
  assert.match(page, /href="\/contact\/"/);
});
