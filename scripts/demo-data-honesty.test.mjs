import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("buyer page uses synthetic demo language and no live claims", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /synthetic demo/);
  assert.match(page, /not an offer for sale/);
  assert.match(page, /does not publish a list price/);
  assert.match(page, /does not show an uptime figure/);
  assert.match(page, /Not a live phone line/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /verified.*WCAG/);
});

test("demo page uses synthetic preview language", () => {
  const page = read("src/app/demo/page.tsx");
  assert.match(page, /Pre-launch synthetic demo/);
  assert.match(page, /Not a live telephone call/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /live phone number/i);
});

test("pricing page does not claim live availability", () => {
  const page = read("src/app/pricing/page.tsx");
  assert.match(page, /prelaunch|pre-launch/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£[0-9]/);
});

test("README does not claim commercial availability", () => {
  const readme = read("README.md");
  assert.match(readme, /Truthful.*pre-launch/);
  assert.match(readme, /PUBLIC_LAUNCH.*defaults to.*false/);
  assert.match(readme, /Never claim commercially live/);
});

test("PUBLIC_LAUNCH defaults to false and fails closed", () => {
  const siteConfig = read("src/config/site.ts");
  assert.match(siteConfig, /publicLaunch:/);
  assert.match(siteConfig, /false/);
  assert.match(siteConfig, /PRE-LAUNCH gate/);
});
