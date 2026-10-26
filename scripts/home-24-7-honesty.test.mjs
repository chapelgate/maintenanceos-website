import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

test("home hero does not claim live 24/7 capture", () => {
  const hero = page.slice(0, page.indexOf("id=\"product\""));
  assert.doesNotMatch(hero, /24\s*\/\s*7/i);
  assert.match(hero, /not a live always-on phone/i);
  assert.match(hero, /Request an early demo/);
  assert.match(hero, /not a booking, checkout, or sale/i);
});

test("home closing band labels demo number as preview not live 24\/7", () => {
  assert.match(page, /Preview demo number \(not production\)/);
  assert.doesNotMatch(page, /Live demo number:/);
  assert.doesNotMatch(page, /answers 24\s*\/\s*7/i);
  assert.match(page, /not a live always-on phone/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
