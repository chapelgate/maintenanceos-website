import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

test("home early-demo CTA stays an interest note", () => {
  assert.match(page, /primaryLabel="Request an early demo"/);
  assert.match(page, /primaryHref="\/demo\/"/);
  assert.match(page, /Early demo request is an interest note/);
  assert.match(page, /not a booking, checkout, or sale/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /book a call/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
