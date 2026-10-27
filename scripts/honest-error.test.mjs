import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

for (const rel of ["src/app/error.tsx", "src/app/global-error.tsx"]) {
  test(`${rel} is an honest pre-launch failure screen`, () => {
    const page = read(rel);
    assert.match(page, /"use client"/);
    assert.match(page, /This page did not finish/);
    assert.match(page, /pre-launch synthetic demo/);
    assert.match(page, /Nothing was sold/);
    assert.match(page, /does not publish a price/);
    assert.match(page, /assign a live phone number/);
    assert.match(page, /Try again/);
    assert.match(page, /void error/);
    assert.doesNotMatch(page, /error\.message/);
    assert.doesNotMatch(page, /error\.digest/);
    assert.doesNotMatch(page, /£/);
    assert.doesNotMatch(page, /buy now/i);
  });

  test(`${rel} announces the failure and focuses the heading`, () => {
    const page = read(rel);
    assert.match(page, /role="alert"/);
    assert.match(page, /tabIndex=\{-1\}/);
    assert.match(page, /useEffect/);
    assert.match(page, /headingRef\.current\?\.focus\(\)/);
    assert.match(page, /useRef/);
  });
}

test("global error keeps the site language and a full document", () => {
  const page = read("src/app/global-error.tsx");
  assert.match(page, /<html lang="en-GB">/);
  assert.match(page, /<body>/);
});

test("route error links home and contact", () => {
  const page = read("src/app/error.tsx");
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/contact\/"/);
});

test("global error links home and contact", () => {
  const page = read("src/app/global-error.tsx");
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /Back to the homepage/);
  assert.match(page, /Contact/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
});
