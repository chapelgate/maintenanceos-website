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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
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
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Nested sample \(mw-160\)/);
  assert.match(page, /across (three|four|five|six) waves/i);
  assert.match(page, /(four|six|all eight) industr/i);
  assert.match(page, /(three|four|five) blogs/i);
  assert.match(page, /robots noindex/);
  assert.match(page, /none claim[\s\S]*WCAG 2\.2 AA certification/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("mw-162 help billing/getting-help/faq are gated and disclosed", () => {
  for (const route of [
    "/help/billing-subscriptions/",
    "/help/getting-help/",
    "/help/faq/",
  ]) {
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Help billing gate \(mw-162\)/);
  assert.match(page, /no published price/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("mw-163 nested sample wave 4 is gated and disclosed", () => {
  for (const route of [
    "/industries/holiday-lets/",
    "/industries/letting-agents/",
    "/blog/uk-property-maintenance-software-landscape-2026/",
    "/compare/worksmartos-vs-fixflo/",
    "/integrations/calendly/",
    "/help/safety-latches/",
  ]) {
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Nested sample \(mw-163\)/);
  assert.match(page, /across (four|five|six) waves/i);
  assert.match(page, /(six|all eight) industr/i);
  assert.match(page, /(four|five) blogs/i);
  assert.match(page, /robots noindex/);
  assert.match(page, /none claim[\s\S]*WCAG 2\.2 AA certification/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("mw-164 help ops routes are gated and disclosed", () => {
  for (const route of [
    "/help/accessibility-features/",
    "/help/troubleshooting-common-issues/",
    "/help/gas-safety-compliance/",
  ]) {
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Help ops gate \(mw-164\)/);
  assert.match(page, /no published price/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("mw-165 nested sample wave 5 is gated and disclosed", () => {
  for (const route of [
    "/industries/facilities-management/",
    "/industries/maintenance-companies/",
    "/blog/uk-maintenance-regulations-what-property-teams-need-to-know/",
    "/compare/worksmartos-vs-dialzara/",
    "/integrations/zapier/",
    "/help/repair-lifecycle/",
  ]) {
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Nested sample \(mw-165\)/);
  assert.match(page, /across (five|six) waves/i);
  assert.match(page, /all eight industr/i);
  assert.match(page, /five blogs/i);
  assert.match(page, /robots noindex/);
  assert.match(page, /none claim[\s\S]*WCAG 2\.2 AA certification/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("mw-166 nested sample wave 6 is gated and disclosed", () => {
  for (const route of [
    "/compare/worksmartos-vs-fasthosts/",
    "/compare/worksmartos-vs-goodcall/",
    "/compare/worksmartos-vs-rosie/",
    "/integrations/hubspot/",
    "/help/emergency-procedures/",
    "/help/hmocompliance/",
  ]) {
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Nested sample \(mw-166\)/);
  assert.match(page, /across six waves/i);
  assert.match(page, /seven\s+compares/i);
  assert.match(page, /six\s+integrations/i);
  assert.match(page, /robots noindex/);
  assert.match(page, /none claim[\s\S]*WCAG 2\.2 AA certification/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});

test("mw-167 help compliance routes are gated and disclosed", () => {
  for (const route of [
    "/help/epc-compliance/",
    "/help/fire-risk-assessment/",
    "/help/contractor-compliance/",
    "/help/assigning-repairs/",
    "/help/tenant-portal/",
    "/help/user-management/",
  ]) {
    assert.match(webkit, new RegExp("'" + escapeRegExp(route) + "'"));
    assert.match(page, new RegExp(escapeRegExp(route)));
  }
  assert.match(page, /Help compliance gate \(mw-167\)/);
  assert.match(page, /no published price/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA (certified|verified|compliant)/i);
});
