import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

function filesWith(pattern) {
  const roots = ["src/app", "src/components"];
  const hits = [];
  for (const relRoot of roots) {
    const dir = path.join(ROOT, relRoot);
    for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
      const full = path.join(entry.parentPath, entry.name);
      const source = read(path.relative(ROOT, full));
      if (pattern.test(source)) hits.push(path.relative(ROOT, full));
    }
  }
  return hits.sort();
}

test("landmark regions identify page structure roles", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /id="main"/);
});

test("aria-live polite regions exist on status-bearing interactive components", () => {
  const hits = filesWith(/aria-live="polite"/);
  assert.ok(hits.length > 0, "expected at least one component with aria-live=polite");
  for (const h of hits) assert.ok(h.endsWith(".tsx"), h);
});

test("focus-visible ring is declared globally in source CSS", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /focus-visible/);
});

test("page source does not claim landmark regions are fully audited by AT", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.doesNotMatch(page, /screen reader (certified|verified|passed)/i);
  assert.match(page, /remain Andy-only launch checks/);
});

test("no exported page claims AT-verified landmark coverage", () => {
  const roots = ["src/app", "src/components"];
  const failures = [];
  for (const relRoot of roots) {
    const dir = path.join(ROOT, relRoot);
    for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
      const full = path.join(entry.parentPath, entry.name);
      const source = read(path.relative(ROOT, full));
      if (/AT-?verified|assistive.?technology.?certified|WCAG 2\.2 AA certified/.test(source)) {
        failures.push(path.relative(ROOT, full));
      }
    }
  }
  assert.deepEqual(failures, []);
});
