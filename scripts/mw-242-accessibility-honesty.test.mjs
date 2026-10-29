import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("accessibility page has content page metadata", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "Accessibility"'));
  assert.ok(page.includes('path: "/accessibility/"'));
  assert.ok(page.includes('Public Sector Bodies'));
});

test("accessibility page has PageHero with voluntary note", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /Voluntary note/);
  assert.match(page, /accessibility target/);
  assert.match(page, /Not a public-sector/);
});

test("accessibility page has honest conformance target", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /Target: WCAG 2.2 Level AA/);
  assert.match(page, /Conformance is <strong>not verified<\/strong>/);
  assert.match(page, /do not claim full WCAG 2.2 AA/);
  assert.match(page, /Lighthouse accessibility score/);
  assert.match(page, /WAVE result/);
  assert.match(page, /assistive-technology sign-off/);
});

test("accessibility page has honest performance budgets", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /performance budget/);
  assert.match(page, /lab-only initial JS/);
  assert.match(page, /CSS payload sizes/);
  assert.match(page, /not a CrUX/);
  assert.match(page, /not field Core Web Vitals/);
});

test("accessibility page has WebKit axe check results", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /axe-core 4.13.0/);
  assert.match(page, /Playwright WebKit/);
  assert.match(page, /iPhone 13/);
  assert.match(page, /Desktop Safari/);
  assert.match(page, /no violations on those seven routes/);
});

test("accessibility page has honest scope limitations", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /automated subset/);
  assert.match(page, /physical iPhone or Mac Safari, nor any screen reader/);
  assert.match(page, /No assistive-technology testing/);
  assert.match(page, /wcag2a/);
  assert.match(page, /wcag2aa/);
  assert.match(page, /wcag21aa/);
  assert.match(page, /wcag22aa/);
});

test("accessibility page has known issues list", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /Nested and dynamic routes/);
  assert.match(page, /Owner-only device and AT checks/);
  assert.match(page, /WCAG 2.2 still not fully covered/);
  assert.match(page, /No assistive-technology testing/);
  assert.match(page, /S26 source merge is not a production deploy/);
});

test("accessibility page has remediation plan", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /Keep source honesty separate from deploy/);
  assert.match(page, /Nested sample gated/);
  assert.match(page, /Automated WCAG 2.2 tags enabled/);
  assert.match(page, /Manual assistive-technology audit/);
  assert.match(page, /Publish updated statement/);
});

test("accessibility page has feedback contact", () => {
  const page = read("src/app/accessibility/page.tsx");
  assert.match(page, /info@chapelgatetechnologies.com/);
  assert.match(page, /If you encounter an accessibility barrier on this site/);
  assert.match(page, /response-time SLA or remediation deadline/);
});