import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const errorPath = read("src/app/error.tsx");
const globalErrorPath = read("src/app/global-error.tsx");

// New: error pages deny live phone/calendar/chat/booking claims
test("error.tsx denies live phone, calendar, chat, or booking claims", () => {
  assert.match(errorPath, /does not publish a price/);
  assert.match(errorPath, /assign a live phone number/);
  assert.match(errorPath, /connect a calendar/);
  assert.match(errorPath, /deliver chat/);
  assert.match(errorPath, /not a live support desk/);
});

test("global-error.tsx denies live phone, calendar, chat, or booking claims", () => {
  assert.match(globalErrorPath, /does not publish a price/);
  assert.match(globalErrorPath, /assign a live phone number/);
  assert.match(globalErrorPath, /connect a calendar/);
  assert.match(globalErrorPath, /deliver chat/);
  assert.match(globalErrorPath, /not a live support desk/);
});

// New: error pages include trust/security recovery links
test("error.tsx includes trust and security recovery links", () => {
  assert.match(errorPath, /\/trust\//);
  assert.match(errorPath, /\/security\//);
});

test("global-error.tsx includes trust and security recovery links", () => {
  assert.match(globalErrorPath, /\/trust\//);
  assert.match(globalErrorPath, /\/security\//);
});

// New: error pages do not expose stack traces or digests
test("error.tsx does not expose stack or digest", () => {
  const jsx = errorPath.slice(errorPath.indexOf("return ("));
  assert.doesNotMatch(jsx, /\{.*digest.*\}/);
  assert.doesNotMatch(jsx, /\{.*stack.*\}/);
  assert.doesNotMatch(errorPath, /console\.(log|error|warn)/);
});

test("global-error.tsx does not expose stack or digest", () => {
  const jsx = globalErrorPath.slice(globalErrorPath.indexOf("return ("));
  assert.doesNotMatch(jsx, /\{.*digest.*\}/);
  assert.doesNotMatch(jsx, /\{.*stack.*\}/);
  assert.doesNotMatch(globalErrorPath, /console\.(log|error|warn)/);
});

// New: error pages document pre-launch synthetic nature honestly
test("error.tsx documents pre-launch synthetic nature honestly", () => {
  assert.match(errorPath, /Pre-launch/);
  assert.match(errorPath, /pre-launch synthetic demo/);
  assert.match(errorPath, /Nothing was sold/);
  assert.match(errorPath, /booked/);
  assert.match(errorPath, /does not publish a price/);
});

test("global-error.tsx documents pre-launch synthetic nature honestly", () => {
  assert.match(globalErrorPath, /Pre-launch/);
  assert.match(globalErrorPath, /pre-launch synthetic demo/);
  assert.match(globalErrorPath, /Nothing was sold/);
  assert.match(globalErrorPath, /booked/);
  assert.match(globalErrorPath, /does not publish a price/);
});