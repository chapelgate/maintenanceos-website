import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");
const perf = fs.readFileSync(path.join(ROOT, "scripts/performance-budget.mjs"), "utf8");

test("accessibility page discloses performance budget is lab evidence, not field Core Web Vitals", () => {
  assert.match(page, /not a CrUX or field Core Web Vitals/);
  assert.match(page, /marketed as one without real field data/);
  assert.match(page, /raw JS ≤ 600 KB/);
  assert.match(page, /gzip JS ≤ 190 KB/);
  assert.match(page, /CSS ≤ 120 KB/);
});

test("performance budget script enforces lab ceilings and missing out/ fails closed", () => {
  assert.match(perf, /out\/ is missing/);
  assert.match(perf, /JS_RAW_BUDGET/);
  assert.match(perf, /JS_GZIP_BUDGET/);
  assert.match(perf, /CSS_BUDGET/);
  assert.doesNotMatch(perf, /CrUX/);
  assert.doesNotMatch(perf, /field/);
});

test("accessibility page does not claim a CrUX or field Core Web Vitals pass", () => {
  assert.doesNotMatch(page, /field Core Web Vitals.*pass/);
  assert.doesNotMatch(page, /CrUX.*verified/);
});
