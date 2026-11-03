import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("WebKit a11y matrix runs against locked routes", () => {
  const a11y = read("tests/webkit-a11y/a11y.test.mjs");
  assert.match(a11y, /browserName:\s*['"]webkit['"]/);
  assert.match(a11y, /pages\s*=/);
  assert.match(a11y, /\.withTags\(\['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'\]\)/);
  assert.doesNotMatch(a11y, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(a11y, /wcag22aa.*certified|wcag22aa.*verified/i);
});

test("WebKit a11y does not claim WCAG 2.2 AA certification", () => {
  const a11y = read("tests/webkit-a11y/a11y.test.mjs");
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /not a full WCAG 2\.2 AA conformance claim|Do not read a green gate as\s+certification/i);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
  assert.doesNotMatch(a11y, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("WebKit a11y runs axe with correct tags", () => {
  const a11y = read("tests/webkit-a11y/a11y.test.mjs");
  assert.match(a11y, /AxeBuilder/);
  assert.match(a11y, /wcag2a/);
  assert.match(a11y, /wcag2aa/);
  assert.match(a11y, /wcag21aa/);
  assert.match(a11y, /wcag22aa/);
});