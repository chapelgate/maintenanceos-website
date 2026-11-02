import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/ai-receptionist/page.tsx"), "utf8");

test("ai-receptionist page recovery links Help How-it-works Security Early-demo", () => {
  assert.match(page, /Related pre-launch pages/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/how-it-works\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /href="\/demo\/"/);
  assert.match(page, /not a live phone/);
  assert.match(page, /not a live receptionist support desk/);
});

test("ai-receptionist recovery stays pre-launch non-selling", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
