import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("performance budget script checks gzip sizes and fails on exceed", () => {
  const script = read("scripts/performance-budget.mjs");
  assert.match(script, /JS_GZIP_BUDGET/);
  assert.match(script, /JS_RAW_BUDGET/);
  assert.match(script, /CSS_BUDGET/);
  assert.match(script, /zlib\.gzipSync/);
  assert.match(script, /failures\.push/);
  assert.match(script, /process\.exitCode/);
});

test("performance budget budgets are lab-only ceilings not field claims", () => {
  const a11y = read("src/app/accessibility/page.tsx");
  const script = read("scripts/performance-budget.mjs");
  assert.match(a11y, /lab-only initial JS/);
  assert.match(a11y, /not a CrUX or field Core Web Vitals/);
  assert.match(a11y, /must not be marketed as one without real field data/);
  assert.doesNotMatch(script, /CrUX/);
  assert.doesNotMatch(script, /field.*Core Web Vitals/);
});

test("performance budget does not claim Lighthouse or RUM scores", () => {
  const script = read("scripts/performance-budget.mjs");
  assert.doesNotMatch(script, /Lighthouse/);
  assert.doesNotMatch(script, /RUM/);
  assert.doesNotMatch(script, /Real User Monitoring/);
});

test("accessibility page documents performance budgets as lab evidence only", () => {
  const a11y = read("src/app/accessibility/page.tsx");
  assert.match(a11y, /Performance budgets are lab evidence, not field Core Web Vitals/);
  assert.match(a11y, /raw JS ≤ 600 KB/);
  assert.match(a11y, /gzip JS ≤ 190 KB/);
  assert.match(a11y, /CSS ≤ 120 KB/);
});