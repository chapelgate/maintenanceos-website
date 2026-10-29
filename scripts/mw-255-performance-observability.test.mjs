import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("performance: next.config.ts has static export output", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes("output: \"export\""));
  assert.ok(config.includes("trailingSlash"));
});

test("performance: error pages have pre-launch synthetic declaration", () => {
  const page = read("src/app/error.tsx");
  assert.ok(page.includes("Pre-launch"));
  assert.ok(page.includes("synthetic demo"));
  assert.ok(page.includes("Nothing was sold"));
});

test("observability: layout has no google fonts api", () => {
  const layout = read("src/app/layout.tsx");
  assert.ok(!layout.includes("fonts.googleapis.com"));
});

test("observability: no dynamic imports of admin-only modules", () => {
  const page = read("src/app/dashboard/page.tsx");
  assert.ok(!page.includes("admin-only"));
});