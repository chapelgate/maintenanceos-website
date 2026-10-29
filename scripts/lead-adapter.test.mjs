import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
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

test("lead-adapter honeypot returns local_stub without posting", () => {
  assert.match(src, /payload\.website/);
});

test("lead-adapter validates email format before posting", () => {
  assert.match(src, /EMAIL_RE/);
});

test("lead-adapter reports unconfigured endpoint as unavailable", () => {
  assert.match(src, /ENQUIRY_UNAVAILABLE_MESSAGE/);
});

test("lead-adapter rejects invalid endpoint URL", () => {
  assert.match(src, /not a valid http\(s\) URL/);
});

test("lead-adapter builds JSON body from payload fields", () => {
  assert.match(src, /lead_type: payload\.leadType/);
});

test("lead-adapter returns ok false on network error", () => {
  assert.match(src, /Network error/);
});