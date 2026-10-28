import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/lead-adapter.ts"), "utf8");

test("lead-adapter exports LeadPayload type", () => {
  assert.match(src, /export type LeadPayload/);
});

test("lead-adapter exports LeadSuccessMode type", () => {
  assert.match(src, /export type LeadSuccessMode/);
});

test("lead-adapter exports LeadResult type", () => {
  assert.match(src, /export type LeadResult/);
});

test("lead-adapter exports submitLead function", () => {
  assert.match(src, /export async function submitLead/);
});
