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
  assert.match(page, /\/help\/getting-started\//);
  const known = page.slice(page.indexOf("Nested and dynamic routes"));
  const uncoveredList = known.slice(0, known.indexOf("</li>"));
  // Sample help article is gated; do not list help index as uncovered.
  assert.doesNotMatch(uncoveredList, /Help index is not covered/i);
  assert.doesNotMatch(uncoveredList, /\/subprocessors\//);
  assert.doesNotMatch(uncoveredList, /\/vulnerability-disclosure\//);
  assert.match(webkit, /'\/help\/getting-started\/'/);
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

test("mw-156/157 nested sample is gated and disclosed", () => {
  for (const route of [
    "/industries/landlords/",
    "/industries/housing-associations/",
    "/blog/ai-voice-demo-browser-only-what-it-means/",
    "/blog/why-safety-latches-matter-in-ai-receptionists/",
    "/compare/worksmartos-vs-moneypenny/",
    "/compare/worksmartos-vs-phena/",
    "/integrations/google/",
    "/integrations/outlook/",
    "/help/getting-started/",
  ]) {
    assert.match(webkit, new RegExp("'" + route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "'"));
    assert.match(page, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /Nested sample gated/);
  assert.match(page, /help article/i);
  assert.match(page, /representative nested sample/i);
  assert.doesNotMatch(page, /Review nested route coverage/);
});

test("mw-158 dashboard preview is gated and disclosed as SAMPLE", () => {
  assert.match(webkit, /'\/dashboard\/'/);
  assert.match(page, /\/dashboard\//);
  assert.match(page, /SAMPLE \/ DEMO/);
  assert.match(page, /dashboard preview route is also axe-gated/i);
  assert.doesNotMatch(page, /dashboard preview are not claimed as covered/i);
});

test("mw-159 exported not-found page is gated and disclosed", () => {
  assert.match(webkit, /'\/404\/'/);
  assert.match(page, /\/404\//);
  assert.match(page, /Not-found export \(mw-159\)/);
  assert.match(page, /exported \/404\/ not-found page/i);
});

test("mw-160 nested sample wave 3 is gated and disclosed", () => {
  for (const route of [
    "/industries/councils/",
    "/industries/property-managers/",
    "/blog/structured-repair-intake-vs-free-text-forms/",
    "/compare/worksmartos-vs-answerconnect/",
    "/integrations/calcom/",
    "/help/data-security/",
  ]) {
    assert.match(webkit, new RegExp("'" + route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "'"));
    assert.match(page, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /Nested sample \(mw-160\)/);
  assert.match(page, /across three waves/i);
  assert.match(page, /four industr/i);
  assert.match(page, /three blogs/i);
  assert.match(page, /robots noindex/);
  assert.match(page, /none claim[\s\S]*WCAG 2\.2 AA certification/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});
