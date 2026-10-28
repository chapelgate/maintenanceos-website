import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("static-security-baseline documents clickjacking gap honestly", () => {
  const doc = read("docs/security/static-security-baseline.md");
  assert.match(doc, /frame-ancestors/);
  assert.match(doc, /honest gap/);
  assert.match(doc, /\*\*Do not:/);
  assert.match(doc, /headers\(\)/);
  assert.match(doc, /App Platform static cannot emit/);
});

test("accessibility launch checklist records manual AT as open item", () => {
  const checklist = read("WEBSITE_LAUNCH_CHECKLIST.md");
  assert.match(checklist, /\[ \] Full manual keyboard \+ assistive-technology pass recorded before public launch/);
  assert.match(checklist, /\[ \] Any issues from that manual pass fixed and re-verified/);
});

test("no claim of verified WCAG 2.2 AA conformance in source", () => {
  const roots = ["src", "docs", "scripts"];
  const violations = [];
  for (const relRoot of roots) {
    const dir = path.join(ROOT, relRoot);
    for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const full = path.join(entry.parentPath, entry.name);
      const source = fs.readFileSync(full, "utf8");
      // Flag only claims that WCAG 2.2 AA is verified/conformance achieved/passed,
      // not honest mentions of it as a target with disclaimers.
      if (
        /WCAG 2\.2 AA\s*(verified|conformance[^.]*achieved|passed|certified)/i.test(source)
      ) {
        violations.push(path.relative(ROOT, full));
      }
    }
  }
  assert.deepEqual(violations, []);
});

test("accessibility baseline test files exist and cover key requirements", () => {
  const requiredTests = [
    "scripts/site-accessibility.test.mjs",
    "scripts/a11y-coverage-honesty.test.mjs",
    "scripts/a11y-s26-honesty.test.mjs",
    "scripts/help-accessibility-features.test.mjs",
    "scripts/create-a11y.test.mjs",
  ];
  for (const rel of requiredTests) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `${rel} missing`);
  }
});

test("manual AT defect recording template exists for Safari/iOS checks", () => {
  const checklist = read("WEBSITE_LAUNCH_CHECKLIST.md");
  assert.match(checklist, /Physical Safari\/iOS plus manual mobile\/keyboard\/assistive-technology pass recorded/);
});