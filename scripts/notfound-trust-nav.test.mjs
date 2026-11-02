import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/not-found.tsx"), "utf8");

test("not-found recovery links Trust Security with missing-page honesty", () => {
  assert.match(page, /Related pre-launch pages/);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/demo\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /not a live support desk/);
  assert.match(page, /Missing-page screen only/);
});

test("not-found trust nav stays pre-launch non-selling", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
