import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/page-meta.ts"), "utf8");

test("page-meta exports FUNNEL_PATH_LABEL constant", () => {
  assert.match(src, /export const FUNNEL_PATH_LABEL/);
});

test("page-meta exports buildRootMetadata function", () => {
  assert.match(src, /export function buildRootMetadata/);
});

test("page-meta exports contentPageMetadata function", () => {
  assert.match(src, /export function contentPageMetadata/);
});

test("page-meta exports funnelPageMetadata function", () => {
  assert.match(src, /export function funnelPageMetadata/);
});

test("page-meta exports industryRoleMetadata function", () => {
  assert.match(src, /export function industryRoleMetadata/);
});
