import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const skip = fs.readFileSync(path.join(ROOT, "src/components/SkipLink.tsx"), "utf8");
const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");

test("skip link targets main and stays in the root layout", () => {
  assert.match(skip, /href="#main"/);
  assert.match(skip, /Skip to main content/);
  assert.match(layout, /<SkipLink\s*\/>/);
  assert.match(layout, /<main id="main"/);
  assert.doesNotMatch(skip, /WCAG 2\.2 AA/);
  assert.doesNotMatch(layout, /WCAG 2\.2 AA verified/);
});
