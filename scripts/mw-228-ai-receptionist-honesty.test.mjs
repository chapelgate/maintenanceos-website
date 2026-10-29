import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("ai-receptionist page has draft status declared", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /Preview/);
  assert.match(page, /Not a live/);
  assert.match(page, /commercial general availability/);
});

test("ai-receptionist page has honest call flow", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /Answer and gather caller details/);
  assert.match(page, /UK terminology/);
  assert.match(page, /999 \(never 911\)/);
  assert.match(page, /Keep consequential commitments out/);
});

test("ai-receptionist page has honest human transfer", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /Callers can request a person/);
  assert.match(page, /Transfer quality is still under retest/);
  assert.match(page, /AI does not replace human clearance/);
});

test("ai-receptionist page has honest mustNotInvent", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /Bookings, dispatches, or arrival times it cannot honour/);
  assert.match(page, /Refunds, compensation, fee waivers/);
  assert.match(page, /Safety assurances beyond approved guidance/);
});

test("ai-receptionist page has honest preview status", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /Controlled voice preview/);
  assert.match(page, /not commercial general availability/);
  assert.match(page, /No invented capacity/);
});

test("ai-receptionist page has honest hero lede", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /The receptionist capability is in preview/);
  assert.match(page, /collecting caller details/);
  assert.match(page, /classifying maintenance requests/);
});

test("ai-receptionist page has JsonLd metadata", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('/ai-receptionist/'));
  assert.ok(page.includes('title: "AI receptionist for UK maintenance intake"'));
});

test("ai-receptionist page references related pages", () => {
  const page = read("src/app/ai-receptionist/page.tsx");
  assert.match(page, /\/security\//);
  assert.match(page, /\/how-it-works\//);
  assert.match(page, /\/property-maintenance-software\//);
  assert.match(page, /\/features\//);
  assert.match(page, /\/faq\//);
});