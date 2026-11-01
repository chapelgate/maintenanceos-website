import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/not-found.tsx"), "utf8");

test("unknown addresses use an honest pre-launch not-found page", () => {
  assert.match(page, /This page is not on the site/);
  assert.match(page, /pre-launch synthetic demo/);
  assert.match(page, /does not publish a price/);
  assert.match(page, /assign a live phone number/);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/demo\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /Help/);
});

test("not-found page does not claim a sale or a live service", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /available now/i);
});
