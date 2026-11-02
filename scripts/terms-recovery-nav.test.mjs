import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/terms/page.tsx"), "utf8");

test("terms page recovery links Help Privacy Cookies Contact", () => {
  assert.match(page, /Related pre-launch pages/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/privacy\/"/);
  assert.match(page, /href="\/cookies\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /not a live counsel desk/);
  assert.match(page, /not binding terms/);
});

test("terms recovery stays pre-launch non-selling", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
