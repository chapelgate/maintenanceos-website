import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("accessibility page has conformance target WCAG 2.2 AA", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.ok(page.includes('Conformance target'));
  assert.ok(page.includes('WCAG 2.2 Level AA'));
  assert.ok(page.includes('not verified'));
});

test("accessibility page has known issues and scope limitations", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.ok(page.includes('Known issues and testing gaps'));
  assert.ok(page.includes('automated subset'));
  assert.ok(page.includes('WCAG 2.2 still not fully covered'));
});

test("accessibility page has remediation plan", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.ok(page.includes('Remediation plan'));
  assert.ok(page.includes('Keep source honesty separate from deploy'));
});

test("accessibility page has feedback contact", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.ok(page.includes('Feedback and barrier reports'));
  assert.ok(page.includes('info@chapelgatetechnologies.com'));
});