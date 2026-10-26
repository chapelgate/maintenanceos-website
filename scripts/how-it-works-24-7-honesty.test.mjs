import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/how-it-works/page.tsx"),
  "utf8",
);

test("how-it-works hero does not claim live 24/7 capture", () => {
  const ledeStart = page.indexOf("lede=");
  assert.ok(ledeStart >= 0, "lede missing");
  const ledeSlice = page.slice(ledeStart, ledeStart + 500);
  assert.doesNotMatch(ledeSlice, /24\s*\/\s*7/i);
  assert.doesNotMatch(ledeSlice, /always-on phone(?!\.)/i);
  assert.match(ledeSlice, /not a live always-on phone/i);
});

test("how-it-works stays pre-launch preview with early demo CTA", () => {
  assert.match(page, /Pre-launch · Preview/);
  assert.match(page, /Request an early demo/);
  assert.match(page, /Not a live public phone number/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
