import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");

test("onboarding page offers recovery links to trust help security", () => {
  assert.match(page, /Related pre-launch pages:/);
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/security\/"/);
});

test("onboarding recovery links stay pre-launch non-selling", () => {
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.match(page, /documentation surfaces — not a live onboarding desk/);
});
