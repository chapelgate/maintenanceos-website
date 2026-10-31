import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("onboarding page declares pre-launch synthetic demo", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");
  assert.match(page, /Pre-launch/);
  assert.match(page, /synthetic demo/);
  assert.match(page, /not an offer/);
  assert.match(page, /does not start a contract/);
  assert.match(page, /no live telephone/);
  assert.match(page, /no price/);
  assert.match(page, /no chat/);
  assert.match(page, /no live data/);
  assert.match(page, /index: false/);
});

test("onboarding page does not sell or certify", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA verified/);
});

test("onboarding page has recovery links", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");
  assert.match(page, /href="\/demo\//);
  assert.match(page, /href="\/pricing\//);
  assert.match(page, /href="\/contact\//);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("onboarding page references Chapelgate Limited", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");
  assert.match(page, /Chapelgate Limited/);
  assert.match(page, /12340004/);
});
