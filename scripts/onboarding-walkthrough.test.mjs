import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");

test("onboarding page has an ordered synthetic walkthrough", () => {
  assert.match(page, /onboarding-walkthrough/);
  assert.match(page, /Synthetic demo walkthrough \(ordered\)/);
  assert.match(page, /<ol /);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/demo\/"/);
  assert.match(page, /href="\/pricing\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /scanner is frozen \(t835u\)/);
});

test("onboarding walkthrough stays pre-launch and non-selling", () => {
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA verified/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
