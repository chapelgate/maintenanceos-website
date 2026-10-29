import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("demo data: dashboard has SAMPLE / DEMO declaration", () => {
  const page = read("src/app/dashboard/page.tsx");
  assert.ok(page.includes("SAMPLE / DEMO"));
  assert.ok(page.includes("not a live customer portal"));
  assert.ok(page.includes("call history"));
});

test("demo data: create page has honest phone declaration", () => {
  const page = read("src/app/create/page.tsx");
  assert.ok(page.includes("does not change your live telephone service"));
  assert.ok(page.includes("temporarily unavailable"));
});

test("demo data: demo page has synthetic demo declarations", () => {
  const page = read("src/app/demo/page.tsx");
  assert.ok(page.includes("Not a live telephone call"));
  assert.ok(page.includes("does not assign a live number"));
  assert.ok(page.includes("Pre-launch synthetic demo"));
});

test("demo data: buyers page has synthetic demo notes", () => {
  const page = read("src/app/buyers/page.tsx");
  assert.ok(page.includes("synthetic demo"));
  assert.ok(page.includes("not an offer for sale"));
  assert.ok(page.includes("Not a live phone line"));
});