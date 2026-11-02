import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/property-maintenance-software/page.tsx"), "utf8");

test("property-maintenance-software page recovery links Help Features Security Contact", () => {
  assert.match(page, /Related pre-launch pages/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/features\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /not a live category support desk/);
  assert.match(page, /not a live phone service/);
});

test("property-maintenance-software recovery stays pre-launch non-selling", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
