import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");

test("accessibility page offers Help Trust Security Contact recovery links", () => {
  assert.match(page, /Related pre-launch pages:/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /not a live accessibility support desk/);
  assert.match(page, /not a WCAG 2\.2 AA certification claim/);
});

test("accessibility recovery stays non-selling", () => {
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
