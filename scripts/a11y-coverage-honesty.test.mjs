import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");

test("accessibility page does not claim WCAG verification", () => {
  assert.match(page, /not verified/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
  assert.match(page, /owner-only checks/i);
  assert.match(page, /Safari\/iOS/);
});

test("gated help subprocessors and vuln routes are not listed as uncovered", () => {
  assert.match(page, /Later gate additions: Help \(\/help\/\)/);
  assert.match(page, /Subprocessors \(\/subprocessors\/\)/);
  assert.match(page, /Vulnerability disclosure \(\/vulnerability-disclosure\/\)/);
  const known = page.slice(page.indexOf("Incomplete route coverage"));
  const uncoveredList = known.slice(0, known.indexOf("</li>"));
  assert.doesNotMatch(uncoveredList, /\/help\//);
  assert.doesNotMatch(uncoveredList, /\/subprocessors\//);
  assert.doesNotMatch(uncoveredList, /\/vulnerability-disclosure\//);
});

test("page stays a voluntary note not a public-sector statement", () => {
  assert.match(page, /not a public-sector accessibility statement/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
