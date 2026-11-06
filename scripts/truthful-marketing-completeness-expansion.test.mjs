import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// New: trust page claims cross-reference register entries
test("trust page claims cross-reference V-claims honestly", () => {
  const trustPage = read("src/app/trust/page.tsx");
  assert.ok(trustPage.includes("voice") || trustPage.includes("Voice"));
  assert.ok(trustPage.includes("extract") || trustPage.includes("business fact"));
  assert.ok(trustPage.includes("review") || trustPage.includes("Review"));
});

// New: security page references S-claims
test("security page references security claims honestly", () => {
  const securityPage = read("src/app/security/page.tsx");
  assert.ok(securityPage.includes("separation") || securityPage.includes("separate"));
  assert.ok(securityPage.includes("CSP") || securityPage.includes("Content-Security"));
  assert.ok(securityPage.includes("Subresource Integrity"));
});

// New: pricing page does not claim live GA pricing
test("pricing page does not claim live GA pricing", () => {
  const pricingPage = read("src/app/pricing/page.tsx");
  assert.match(pricingPage, /Request an early demo|pre-launch|synthetic|Not live|not live|not commercially/);
});

// New: features page documents what is live vs preview
test("features page documents preview/live status honestly", () => {
  const featuresPage = read("src/app/features/page.tsx");
  assert.ok(featuresPage.includes("preview") || featuresPage.includes("Preview") ||
           featuresPage.includes("pre-launch") || featuresPage.includes("Not live") ||
           featuresPage.includes("early access") || featuresPage.includes("Early access"));
});

// New: accessibility page documents axe coverage honestly
test("accessibility page documents axe coverage and WCAG claims honestly", () => {
  const a11yPage = read("src/app/accessibility/page.tsx");
  assert.match(a11yPage, /wcag21aa|wcag22aa|axe-core/);
  assert.match(a11yPage, /not.*WCAG|not.*certified|not.*verified|no.*claim|honest/);
});

// New: create page documents preview nature
test("create page documents preview/synthetic nature honestly", () => {
  const createPage = read("src/app/create/page.tsx");
  assert.ok(createPage.includes("preview") || createPage.includes("Preview") ||
           createPage.includes("synthetic") || createPage.includes("pre-launch") ||
           createPage.includes("early access") || createPage.includes("Early access"));
});

// New: buyers page documents synthetic data
test("buyers page documents synthetic demo data honestly", () => {
  const buyersPage = read("src/app/buyers/page.tsx");
  assert.ok(buyersPage.includes("synthetic") || buyersPage.includes("Synthetic"));
  assert.ok(buyersPage.includes("no live customer") || buyersPage.includes("No live customer"));
});

// New: home page documents pre-launch
test("home page documents pre-launch nature honestly", () => {
  const homePage = read("src/app/page.tsx");
  assert.ok(homePage.includes("Pre-launch") || homePage.includes("pre-launch") ||
           homePage.includes("early access") || homePage.includes("Early access"));
});