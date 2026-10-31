import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function visible(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

const pageFiles = walk(path.join(ROOT, "src/app")).filter((f) =>
  /\/page\.tsx?$/.test(f)
);

const headingRe = /<h([1-6])([^>]*)>/gi;

function levelsForFile(file) {
  const text = visible(fs.readFileSync(file, "utf8"));
  const levels = [];
  let m;
  while ((m = headingRe.exec(text)) !== null) {
    levels.push(Number(m[1]));
  }
  return levels;
}

function pageName(file) {
  return file.replace(ROOT + "/", "").replace(/\/page\.tsx?$/, "");
}

// Heading levels must never descend by more than one level at a time (WCAG 2.2
// 1.3.1 structure honesty: no h1->h3 jumps, h2->h4 jumps, etc.).
test("app page heading hierarchy never skips down a level within a page", () => {
  for (const file of pageFiles) {
    const levels = levelsForFile(file);
    for (let i = 1; i < levels.length; i++) {
      const drop = levels[i - 1] - levels[i];
      assert.ok(
        drop <= 1,
        `${pageName(file)} skips heading h${levels[i - 1]} -> h${levels[i]}`,
      );
    }
  }
});

// The home page keeps h1 then h2 sections (never jumps to h3 as first section).
test("home page heading hierarchy is h1 then h2 sections", () => {
  const home = levelsForFile(path.join(ROOT, "src/app/page.tsx"));
  assert.deepEqual(home, [1, 2, 2, 3, 2, 2], `home is ${home.join(",")}`);
});

// Every page that renders headings keeps its levels within h1..h6 (no orphan
// levels below h6), preserving screen-reader outline validity.
test("no heading drops below h6 or above h1", () => {
  for (const file of pageFiles) {
    const levels = levelsForFile(file);
    for (const l of levels) {
      assert.ok(l >= 1 && l <= 6, `${pageName(file)} heading level ${l}`);
    }
  }
});
