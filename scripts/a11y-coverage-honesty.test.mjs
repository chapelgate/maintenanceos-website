import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");
const webkit = fs.readFileSync(
  path.join(ROOT, "tests/webkit-a11y/a11y.test.mjs"),
  "utf8",
);

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
  const known = page.slice(page.indexOf("Nested and dynamic routes"));
  const uncoveredList = known.slice(0, known.indexOf("</li>"));
  assert.doesNotMatch(uncoveredList, /\/help\//);
  assert.doesNotMatch(uncoveredList, /\/subprocessors\//);
  assert.doesNotMatch(uncoveredList, /\/vulnerability-disclosure\//);
});

test("page does not list WebKit-gated index routes as uncovered", () => {
  assert.match(webkit, /'\/faq\/'/);
  assert.match(webkit, /'\/accessibility\/'/);
  assert.match(webkit, /'\/trust\/'/);
  assert.match(page, /Current WebKit matrix also gates/);
  assert.match(page, /tests\/webkit-a11y\/a11y\.test\.mjs/);
  assert.match(page, /Nested and dynamic routes/);
  assert.doesNotMatch(
    page,
    /still does not run against \/faq\/, \/blog\/, \/trust\/, \/compare\//,
  );
  assert.doesNotMatch(page, /Expand automated route coverage/);
});

test("page stays a voluntary note not a public-sector statement", () => {
  assert.match(page, /not a public-sector accessibility statement/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("mw-156 nested sample is gated and disclosed", () => {
  for (const route of [
    "/industries/landlords/",
    "/blog/ai-voice-demo-browser-only-what-it-means/",
    "/compare/worksmartos-vs-moneypenny/",
    "/integrations/google/",
  ]) {
    assert.match(webkit, new RegExp("'" + route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "'"));
    assert.match(page, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /Nested sample gated/);
  assert.match(page, /representative nested sample/i);
  assert.doesNotMatch(page, /Review nested route coverage/);
});
