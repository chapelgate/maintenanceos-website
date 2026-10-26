import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/privacy/page.tsx"), "utf8");

test("privacy page replaces [ANDY:] placeholders with pending-counsel wording", () => {
  assert.match(
    page,
    /ICO registration: pending counsel confirmation — number not published on this draft notice/,
  );
  assert.match(
    page,
    /Pending counsel review: transfer mechanisms if any processor is outside the UK\/EEA are not yet final on this draft notice/,
  );
  assert.match(
    page,
    /Pending counsel review: age threshold for children not yet final/,
  );
  assert.match(
    page,
    /Pending counsel review: how updates will be shown \(date and material-change practice\) is not yet final on this draft notice/,
  );
  assert.doesNotMatch(page, /\[ANDY:/);
  assert.match(page, /Privacy Policy \(Draft\)/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
