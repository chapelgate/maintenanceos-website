import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");

test("demo page recovery links include Help Contact Security with Trust", () => {
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /not a live support desk/);
  assert.match(page, /id="demo-trust-link"/);
});

test("demo recovery stays pre-launch non-selling", () => {
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
