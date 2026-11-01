import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("SiteHeader targets meet WCAG 2.2 minimum target size baseline", () => {
  const header = read("src/components/SiteHeader.tsx");
  assert.match(header, /h-9 min-h-6/);
  assert.match(header, /h-9 w-9 min-h-6 min-w-6/);
  assert.match(header, /h-10 min-h-6/);
});

test("CtaPair targets meet WCAG 2.2 minimum target size baseline", () => {
  const ctas = read("src/components/CtaPair.tsx");
  assert.match(ctas, /min-h-11 min-w-6/);
});

test("IndustryRolePage benefit cards have adequate hit area", () => {
  const benefitsEl = read("src/components/BentoCard.tsx");
  // Each benefit card must be at least 24x24 CSS pixels
  assert.match(benefitsEl, /min-h|min-w|p-|px-/);
});