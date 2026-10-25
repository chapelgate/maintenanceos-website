import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", ".git", "out", ".next", "coverage"]);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (
      entry.isFile() &&
      entry.name.endsWith(".tsx") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      acc.push(full);
    }
  }
  return acc;
}

function codeOnly(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = walk(path.join(ROOT, "src"));

test("every img element supplies a non-empty alt prop", () => {
  const hits = [];
  const imgOpen = /<img\b[\s\S]*?>/g;
  const hasAlt = /\balt\s*=\s*(?:\{[^}]+\}|("[^"]*"|'[^']*'))/;

  for (const file of files) {
    const text = codeOnly(fs.readFileSync(file, "utf8"));
    for (const m of text.matchAll(imgOpen)) {
      const tag = m[0];
      const altMatch = tag.match(hasAlt);
      if (!altMatch) {
        hits.push({
          file: path.relative(ROOT, file),
          reason: "missing alt",
          tag: tag.slice(0, 120),
        });
        continue;
      }
      const literal = altMatch[1];
      if (typeof literal === "string" && (literal === '""' || literal === "''")) {
        hits.push({
          file: path.relative(ROOT, file),
          reason: "empty alt literal",
          tag: tag.slice(0, 120),
        });
      }
    }
  }

  assert.deepEqual(hits, []);
});

test("HomePhoto and CaseStudyCard render img with alt", () => {
  const home = codeOnly(
    fs.readFileSync(path.join(ROOT, "src/components/HomePhoto.tsx"), "utf8"),
  );
  const card = codeOnly(
    fs.readFileSync(path.join(ROOT, "src/components/CaseStudyCard.tsx"), "utf8"),
  );
  assert.match(home, /<img\b[\s\S]*?\balt=\{alt\}/);
  assert.match(card, /<img\b[\s\S]*?\balt=\{logo\.alt\}/);
});
