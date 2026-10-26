import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const demo = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");

test("demo timeline describes a scripted browser preview", () => {
  assert.match(demo, /What the scripted preview does/);
  assert.match(demo, /A person describes a repair in the browser preview/);
  assert.match(demo, /Not a live telephone call/);
  assert.match(demo, /does not assign a live\s+number/);
});

test("demo timeline does not describe a telephone call", () => {
  assert.doesNotMatch(demo, /What happens on the call/);
  assert.doesNotMatch(demo, /Caller explains/);
});
