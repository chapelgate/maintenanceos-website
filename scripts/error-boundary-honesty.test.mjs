import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("error.tsx suppresses diagnostics and is honest about pre-launch", () => {
  const page = read("src/app/error.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /pre-launch synthetic demo/);
  assert.match(page, /Nothing was sold,/);
  assert.match(page, /booked,/);
  assert.match(page, /or connected from this screen/);
  assert.match(page, /does not publish a price/);
  assert.match(page, /assign a live phone number/);
  assert.match(page, /connect a calendar/);
  assert.match(page, /deliver chat/);
  assert.match(page, /Failure screen only — not a live support desk/);
  const jsx = page.slice(page.indexOf("return ("));
  assert.doesNotMatch(jsx, /\{.*digest.*\}/);
  assert.doesNotMatch(jsx, /\{.*stack.*\}/);
  assert.doesNotMatch(page, /console\.(log|error|warn)/);
});

test("global-error.tsx suppresses diagnostics and is honest about pre-launch", () => {
  const page = read("src/app/global-error.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /pre-launch synthetic demo/);
  assert.match(page, /Nothing was sold,/);
  assert.match(page, /booked,/);
  assert.match(page, /or connected from this screen/);
  assert.match(page, /does not publish a price/);
  assert.match(page, /assign a live phone number/);
  assert.match(page, /connect a calendar/);
  assert.match(page, /deliver chat/);
  assert.match(page, /Failure screen only — not a live support desk/);
  const jsx = page.slice(page.indexOf("return ("));
  assert.doesNotMatch(jsx, /\{.*digest.*\}/);
  assert.doesNotMatch(jsx, /\{.*stack.*\}/);
  assert.doesNotMatch(page, /console\.(log|error|warn)/);
});