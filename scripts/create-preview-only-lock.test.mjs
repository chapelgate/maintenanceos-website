import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/create/page.tsx"), "utf8");

test("create page labels the demo number as preview not live production", () => {
  assert.match(page, /Preview demo number \(not production\)/);
  assert.doesNotMatch(page, /Live demo number available/i);
  assert.match(page, /not a live always-on phone/i);
  assert.match(page, /Not a production answering service/i);
});

test("create page does not claim live 24\/7 answering in the demo blurb", () => {
  const demoBlockStart = page.indexOf("demoPhoneNumber");
  assert.ok(demoBlockStart >= 0);
  const demoBlock = page.slice(demoBlockStart, demoBlockStart + 900);
  assert.doesNotMatch(demoBlock, /call 24\s*\/\s*7/i);
  assert.doesNotMatch(demoBlock, /answers 24\s*\/\s*7/i);
});

test("create funnel stays preview-only with honest limits", () => {
  assert.match(page, /Repair intake · Preview/);
  assert.match(page, /How the preview funnel is designed to work/);
  assert.match(page, /Honest limits/);
  assert.match(page, /does not assign or dial a public telephone number/i);
  assert.match(page, /Request early access/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
