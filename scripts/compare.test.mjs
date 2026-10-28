import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/compare.ts"), "utf8");

test("compare exports COMPARISON_SLUGS constant", () => {
  assert.match(src, /export const COMPARISON_SLUGS/);
});

test("compare exports ComparisonSlug type", () => {
  assert.match(src, /export type ComparisonSlug/);
});

test("compare exports ComparisonSource interface", () => {
  assert.match(src, /export interface ComparisonSource/);
});

test("compare exports ComparisonFrontmatter interface", () => {
  assert.match(src, /export interface ComparisonFrontmatter/);
});

test("compare exports ComparisonData interface", () => {
  assert.match(src, /export interface ComparisonData/);
});

test("compare exports getComparisonBySlug function", () => {
  assert.match(src, /export function getComparisonBySlug/);
});
