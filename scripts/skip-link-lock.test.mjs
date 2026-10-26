import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const skip = fs.readFileSync(path.join(ROOT, "src/components/SkipLink.tsx"), "utf8");
const appDir = path.join(ROOT, "src/app");

function listLayouts(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listLayouts(full));
    else if (entry.name === "layout.tsx") out.push(full);
  }
  return out;
}

test("skip link targets main and stays in the root layout", () => {
  const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
  assert.match(skip, /href="#main"/);
  assert.match(skip, /Skip to main content/);
  assert.match(layout, /<SkipLink\s*\/>/);
  assert.match(layout, /<main id="main"/);
  assert.doesNotMatch(skip, /WCAG 2\.2 AA/);
  assert.doesNotMatch(layout, /WCAG 2\.2 AA verified/);
});

test("every app layout keeps skip-link or nested-safe landmarks", () => {
  const layouts = listLayouts(appDir);
  assert.ok(layouts.length >= 1, "expected at least the root layout");
  for (const file of layouts) {
    const rel = path.relative(ROOT, file);
    const src = fs.readFileSync(file, "utf8");
    if (rel === path.join("src", "app", "layout.tsx")) {
      assert.match(src, /<SkipLink\s*\/>/, `${rel} must render SkipLink`);
      assert.match(src, /<main id="main"/, `${rel} must expose #main`);
      continue;
    }
    assert.doesNotMatch(
      src,
      /<main(?![^>]*id="main")/,
      `${rel} must not introduce a second main without id=main`,
    );
    assert.doesNotMatch(src, /WCAG 2\.2 AA verified/);
  }
});
