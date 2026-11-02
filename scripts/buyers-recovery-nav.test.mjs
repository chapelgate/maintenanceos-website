import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/buyers/page.tsx"), "utf8");

test("buyers page recovery links include Help Trust Security Contact", () => {
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /not a live buyers support desk/);
});

test("buyers recovery stays pre-launch non-selling", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
