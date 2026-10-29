import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("seo meta honesty: buyer pack page has noindex", () => {
  const buyers = read("src/app/buyers/page.tsx");
  assert.match(buyers, /index:\s*false/);
});

test("seo meta honesty: dashboard page has noindex", () => {
  const dashboard = read("src/app/dashboard/page.tsx");
  assert.match(dashboard, /index:\s*false/);
});

test("seo meta honesty: status page has noindex", () => {
  const status = read("src/app/status/page.tsx");
  assert.match(status, /index:\s*false/);
});

test("seo meta honesty: robots.txt has disallow rules for private paths", () => {
  const robots = read("src/app/robots.ts");
  assert.match(robots, /disallow/);
  assert.match(robots, /\/dashboard/);
  assert.match(robots, /\/buyers/);
  assert.match(robots, /\/status/);
  assert.match(robots, /\/api/);
});

test("seo meta honesty: meta descriptions deny phone/SLA", () => {
  const meta = read("src/lib/page-meta.ts");
  assert.match(meta, /denies? phone|no phone|not a live phone/i);
});