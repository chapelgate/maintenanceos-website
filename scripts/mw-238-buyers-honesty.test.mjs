import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("buyer note page has content page metadata", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "Buyer note"'));
  assert.ok(page.includes('path: "/buyers/"'));
  assert.ok(page.includes('Pre-launch buyer note'));
});

test("buyer note page has PageHero with synthetic demo declaration", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /synthetic demo/);
  assert.match(page, /not an offer for sale/);
  assert.match(page, /does not start a contract/);
});

test("buyer note page has honest what you can inspect", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /homepage/);
  assert.match(page, /scripted browser preview/);
  assert.match(page, /pricing page/);
  assert.match(page, /status page/);
});

test("buyer note page has Andy synthetic demo cross-references", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /Andy synthetic demo/);
  assert.match(page, /accessibility/);
  assert.match(page, /security\.txt/);
  assert.match(page, /vulnerability-disclosure/);
});

test("buyer note page has honest what this is not", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /Not a checkout/);
  assert.match(page, /Not a live phone/);
  assert.match(page, /Not a chat service/);
  assert.match(page, /WCAG 2.2 AA has been verified/);
});

test("buyer note page has CTA links", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/demo\//);
  assert.match(page, /href="\/pricing\//);
  assert.match(page, /href="\/contact\//);
});