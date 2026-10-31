import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/onboarding/page.tsx"), "utf8");
const routes = fs.readFileSync(path.join(ROOT, "src/config/routes.ts"), "utf8");

test("onboarding page stays a noindex pre-launch walkthrough", () => {
  assert.match(page, /synthetic demo of the MaintenanceOS onboarding/);
  assert.match(page, /not an offer for service/);
  assert.match(page, /does not start a contract/);
  assert.match(page, /Not a live phone line/);
  assert.match(page, /Not a claim that WCAG 2\.2 AA has been verified/);
  assert.match(page, /Chapelgate Limited, company number 12340004/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(routes, /\/onboarding\//);
});

test("onboarding page does not sell or certify", () => {
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA verified/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("onboarding page links stay pre-launch", () => {
  assert.match(page, /href="\//);
  assert.match(page, /href="\/demo\//);
  assert.match(page, /href="\/pricing\//);
  assert.match(page, /href="\/contact\//);
});
