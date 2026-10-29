import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("how-it-works page has funnel page metadata", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.ok(page.includes("export const metadata"));
  assert.ok(page.includes('funnelPageMetadata'));
  assert.ok(page.includes('howItWorks'));
});

test("how-it-works page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /Preview/);
  assert.match(page, /not a live always-on phone/);
});

test("how-it-works page has IntakeJourneyFlow component", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /IntakeJourneyFlow/);
});

test("how-it-works page has HowItWorksFlow component", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /HowItWorksFlow/);
});

test("how-it-works page has UK scenario vignettes", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /UkScenarioVignettes/);
});

test("how-it-works page has ProductTour with preview disclaimer", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /ProductTour/);
  assert.match(page, /Not a live public phone number/);
});

test("how-it-works page has SafeAutomationLink", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /SafeAutomationLink/);
});

test("how-it-works page has ObjectionFaq", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /ObjectionFaq/);
});

test("how-it-works page references demo CTA", () => {
  const page = read("src/app/how-it-works/page.tsx");
  assert.match(page, /\/demo\//);
  assert.match(page, /Request an early demo/);
});