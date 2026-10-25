import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx?|mdx?|txt)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

function visible(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = [
  ...walk(path.join(ROOT, "src")),
  ...walk(path.join(ROOT, "public")),
].map((file) => ({
  file,
  text: visible(fs.readFileSync(file, "utf8")),
}));

const forbidden = [
  /meets WCAG 2\.2 AA/i,
  /WCAG 2\.2 AA compliant/i,
  /verified WCAG 2\.2 AA/i,
];

const honesty = /do not claim|not a claim|not verified|not claiming|independent audit planned|working toward WCAG/i;

test("no public source claims WCAG 2.2 AA is met or verified", () => {
  for (const pattern of forbidden) {
    for (const item of files) {
      assert.doesNotMatch(item.text, pattern, `${item.file} matches ${pattern}`);
    }
  }
});

test("any WCAG 2.2 AA mention keeps an honesty qualifier", () => {
  for (const item of files) {
    if (!/WCAG 2\.2 AA/i.test(item.text)) continue;
    assert.match(
      item.text,
      honesty,
      `${item.file} mentions WCAG 2.2 AA without an honesty qualifier`,
    );
  }
});
