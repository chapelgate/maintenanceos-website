import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("header wordmark name comes from visible text only", () => {
  const header = read("src/components/SiteHeader.tsx");
  const block = header.match(/function Wordmark\(\)[\s\S]*?\r?\n}\r?\n/)?.[0] ?? "";
  assert.match(block, /WorkSmartOS/);
  assert.doesNotMatch(block, /WorkSmart OS/);
  assert.doesNotMatch(block, /by Chapelgate/);
  assert.doesNotMatch(block, /aria-label=/);
});

test("footer wordmark name comes from visible text only", () => {
  const footer = read("src/components/SiteFooter.tsx");
  assert.match(footer, /WorkSmartOS/);
  assert.match(footer, /WorkSmartOS by Chapelgate Technologies/);
  assert.doesNotMatch(footer, /WorkSmart OS/);
  assert.doesNotMatch(footer, /font-medium text-muted">\s*by Chapelgate/);
  assert.doesNotMatch(footer, /aria-label=\{siteConfig\.publicBrand\}/);
});