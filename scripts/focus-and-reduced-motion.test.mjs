import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("CSS reduces motion for prefers-reduced-motion: reduce", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation-duration:\s*0\.01ms !important/);
  assert.match(css, /transition-duration:\s*0\.01ms !important/);
});

test("focus-visible outlines use brand colour with adequate contrast", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /a:focus-visible,/);
  assert.match(css, /button:focus-visible,/);
  assert.match(css, /:focus-visible\s*\{/);
});

test("skip link focuses to main content without being obscured", () => {
  const layout = read("src/app/layout.tsx");
  const skip = read("src/components/SkipLink.tsx");
  assert.match(layout, /<main id="main" tabIndex=\{-1\}/);
  assert.match(layout, /<SkipLink \/>/);
  assert.match(layout, /SkipLink/);
  assert.match(skip, /href="#main"/);
  assert.match(skip, /Skip to main content/);
});