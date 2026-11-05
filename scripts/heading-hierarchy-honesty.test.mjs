import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const a11y = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");
const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");

function extractHeadings(source) {
  const headings = [];
  const headingRegex = /<h([1-6])[^>]*id=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = headingRegex.exec(source)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
    });
  }
  return headings;
}

test("accessibility page sections use sequential h2 without jumps", () => {
  const headings = extractHeadings(a11y);
  // All sections should be h2 (h1 comes from PageHero component)
  const sectionHeadings = headings.filter(h => h.level === 2);
  assert.equal(sectionHeadings.length, 8, "Expected 8 h2 sections");
  const ids = sectionHeadings.map(h => h.id);
  assert.deepEqual(ids, [
    "a11y-scope",
    "a11y-target",
    "a11y-criteria",
    "a11y-perf",
    "a11y-run",
    "a11y-known",
    "a11y-plan",
    "a11y-contact",
  ]);
});

test("accessibility page uses PageHero for h1 then h2 sections only", () => {
  assert.match(a11y, /PageHero/);
  // PageHero renders the h1, sections are h2 - no h3-h6 with ids in this page
  const higherHeadings = extractHeadings(a11y).filter(h => h.level > 2);
  assert.equal(higherHeadings.length, 0, "No h3-h6 with ids in accessibility page");
});

test("layout does not inject h1 - single h1 per page from PageHero in page components", () => {
  const mainContent = layout.slice(layout.indexOf("<main"));
  const h1Count = (mainContent.match(/<h1\b/gi) || []).length;
  assert.equal(h1Count, 0, "Layout should not add h1; pages use PageHero for their h1");
});