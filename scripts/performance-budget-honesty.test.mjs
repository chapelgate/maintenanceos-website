import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("performance-budget.mjs fails closed when out/ is missing", () => {
  const budget = read("scripts/performance-budget.mjs");
  assert.match(budget, /out\/ is missing/);
  assert.match(budget, /process\.exit\(2\)/);
});

test("performance-budget.mjs has no CrUX or field CWV claims", () => {
  const budget = read("scripts/performance-budget.mjs");
  assert.doesNotMatch(budget, /CrUX/);
  assert.doesNotMatch(budget, /field.*Core Web Vitals/i);
  assert.doesNotMatch(budget, /real.*user.*metric/i);
});

test("performance-budget.mjs documents lab budgets only", () => {
  const budget = read("scripts/performance-budget.mjs");
  assert.match(budget, /JS_RAW_BUDGET/);
  assert.match(budget, /JS_GZIP_BUDGET/);
  assert.match(budget, /CSS_BUDGET/);
  assert.match(budget, /initial first-party/);
  assert.match(budget, /third-party script source found/);
});

test("PERFORMANCE_BUDGET.md references lab budgets, not field", () => {
  const doc = read("PERFORMANCE_BUDGET.md");
  assert.match(doc, /lab/i);
  assert.doesNotMatch(doc, /CrUX/);
  assert.doesNotMatch(doc, /field.*data/i);
});

test("STEP46_PERFORMANCE_BASELINE.md is honest about lab vs field", () => {
  const doc = read("docs/STEP46_PERFORMANCE_BASELINE.md");
  assert.match(doc, /lab|local|synthetic/i);
  // Does not claim verified field metrics
  assert.doesNotMatch(doc, /verified.*field/i);
});
