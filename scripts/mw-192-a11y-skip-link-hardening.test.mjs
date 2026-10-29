import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("mw-192: SkipLink component renders with skip-to-main label", () => {
  const link = read("src/components/SkipLink.tsx");
  assert.match(link, /Skip to main content/);
  assert.match(link, /href="#main"/);
});

test("mw-192: RootLayout renders SkipLink", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /<SkipLink \/>/);
});

test("mw-192: main landmark has id main", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /id="main"/);
});
