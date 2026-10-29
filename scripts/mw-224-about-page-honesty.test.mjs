import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("about page has metadata export", () => {
  const about = read("src/app/about/page.tsx");
  assert.ok(about.includes("export const metadata"));
});

test("about page has honest pre-launch declaration", () => {
  const about = read("src/app/about/page.tsx");
  // The page explicitly declares it is pre-launch and what is not claimed
  assert.match(about, /Pre-launch/);
  // Page states what is NOT invented - this is the honesty guarantee
  assert.match(about, /do not invent team bios, fake customer logos, awards, or uptime percentages/);
  // But the page itself should not make unverifiable award claims
  assert.doesNotMatch(about, /received the/);
  assert.doesNotMatch(about, /award-winning/);
});

test("about page metadata structure is valid", () => {
  const about = read("src/app/about/page.tsx");
  assert.ok(about.includes("title: \"About\""));
  assert.ok(about.includes('path: "/about/"'));
  assert.ok(about.includes("description:"));
});