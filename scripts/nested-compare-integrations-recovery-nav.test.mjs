import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const compare = fs.readFileSync(path.join(ROOT, "src/app/compare/[slug]/page.tsx"), "utf8");
const integ = fs.readFileSync(path.join(ROOT, "src/app/integrations/[provider]/page.tsx"), "utf8");

test("compare slug page recovery links Compare Help Trust Contact", () => {
  assert.match(compare, /PreLaunchRecoveryNav/);
  assert.match(compare, /href: "\/compare\/"/);
  assert.match(compare, /href: "\/help\/"/);
  assert.match(compare, /href: "\/trust\/"/);
  assert.match(compare, /href: "\/contact\/"/);
  assert.match(compare, /Comparison page only/);
  assert.doesNotMatch(compare, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(compare, /buy now/i);
});

test("integrations provider page recovery links Integrations Help Security Contact", () => {
  assert.match(integ, /PreLaunchRecoveryNav/);
  assert.match(integ, /href: "\/integrations\/"/);
  assert.match(integ, /href: "\/help\/"/);
  assert.match(integ, /href: "\/security\/"/);
  assert.match(integ, /href: "\/contact\/"/);
  assert.match(integ, /Integration preview only/);
  assert.doesNotMatch(integ, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(integ, /buy now/i);
});
