import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const OBJECTION_QUESTIONS = [
  "Is there a live always-on phone line I can call now?",
  "Can it book or reschedule calendar appointments?",
  "Will MaintenanceOS invent bookings, dispatches, or refunds?",
  "What about emergencies vs routine jobs (UK)?",
  "Why only seven features on /features?",
];

test("FeatureStatusChip encodes VERIFIED solid blue and UNDER TEST outline", () => {
  const chip = read("src/components/FeatureStatusChip.tsx");
  const css = read("src/app/globals.css");
  const features = read("src/app/features/page.tsx");
  const config = read("src/config/phone-ai-features.ts");

  assert.match(chip, /export function FeatureStatusChip/);
  assert.match(chip, /feature-status-chip--verified/);
  assert.match(chip, /feature-status-chip--under-test/);
  assert.match(css, /\.feature-status-chip--verified/);
  assert.match(css, /background: var\(--color-accent-subtle\)/);
  assert.match(css, /\.feature-status-chip--under-test/);
  assert.match(css, /color: var\(--color-warn\)/);
  assert.match(features, /<FeatureStatusChip status=\{card\.status\}/);
  assert.match(features, /UNDER_TEST_GROUP_HONESTY/);
  assert.match(config, /Not on site yet — tracked with product/);
  assert.doesNotMatch(features, /phoneAiNotClaimed/);
  assert.doesNotMatch(features, /Explore all gaps/);
  assert.doesNotMatch(features, /ObjectionFaq/);
});

test("nav desktop labels stay wrap-safe single-line units", () => {
  const header = read("src/components/SiteHeader.tsx");
  const site = read("src/config/site.ts");
  const css = read("src/app/globals.css");

  assert.match(site, /label: "How it works"/);
  assert.match(site, /Dashboard \(soon\)/);
  assert.match(header, /min-h-16/);
  assert.match(header, /flex-wrap/);
  assert.match(css, /\.site-nav-link[\s\S]*text-wrap: nowrap/);
  assert.match(css, /\.site-nav-link[\s\S]*white-space: nowrap/);
});

test("home trust strip, tour caption, and role chips stay claims-safe", () => {
  const home = read("src/app/page.tsx");
  const strip = read("src/components/HomeTrustStrip.tsx");
  const chips = read("src/components/HomeRoleChips.tsx");
  const tour = read("src/lib/product-tour.ts");
  const watch = read("src/components/ProductTour.tsx");

  assert.match(home, /HomeTrustStrip/);
  assert.match(strip, /Pre-launch · UK maintenance ops · Rules own safety/);
  assert.doesNotMatch(strip, /logo|trustpilot|testimonial/i);

  assert.match(home, /ProductTourWatchLink/);
  assert.match(tour, /watchLabel: "45s product tour · pre-launch"/);
  assert.match(tour, /watchHref: "\/how-it-works\/#product-tour"/);
  assert.doesNotMatch(watch, /\bautoPlay\b/);
  assert.doesNotMatch(home, /<video/);

  assert.match(home, /HomeRoleChips/);
  assert.match(chips, /\/industries\/landlords\//);
  assert.match(chips, /\/industries\/letting-agents\//);
  assert.match(chips, /\/industries\/property-managers\//);
  assert.doesNotMatch(chips, /always-on|live phone|beats Fonio/i);
});

test("HIW step cards are a mos-glass number→title→status ladder", () => {
  const flow = read("src/components/HowItWorksFlow.tsx");
  assert.match(flow, /FeatureStatusChip/);
  assert.match(flow, /number → title → status/);
  assert.match(flow, /Website → Check → Review → Pack/);
  assert.match(flow, /mos-glass/);
  assert.match(flow, /hiw-step-number/);
  assert.match(flow, /bg-paper/);
  assert.match(flow, /do not invent extracted hours/);
});

test("/create stepper chrome is sticky Website → Check → Review → Pack", () => {
  const stepper = read("src/components/CreateJourneyStepper.tsx");
  const css = read("src/app/globals.css");
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  const preview = read("src/components/ReceptionistDraftPreview.tsx");

  assert.match(stepper, /create-step-chrome/);
  assert.match(stepper, /CREATE_JOURNEY_STEPS/);
  assert.match(css, /\.create-step-chrome/);
  assert.match(css, /position: sticky/);
  assert.match(later, /Website crawl is queued/);
  assert.match(later, /will not invent crawl/);
  assert.match(preview, /Empty facts/);
  assert.match(preview, /create-missing-chip/);
  assert.doesNotMatch(later, /Mon–Fri 09:00/);
});

test("objection FAQ pack is on home and how-it-works, not features", () => {
  const faqs = read("src/content/objection-faqs.ts");
  const home = read("src/app/page.tsx");
  const hiw = read("src/app/how-it-works/page.tsx");
  const features = read("src/app/features/page.tsx");
  const accordion = read("src/components/ObjectionFaq.tsx");

  assert.equal(OBJECTION_QUESTIONS.length, 5);
  for (const question of OBJECTION_QUESTIONS) {
    assert.match(faqs, new RegExp(question.replace(/[?()]/g, "\\$&")));
  }
  assert.match(faqs, /UNDER TEST/);
  assert.match(faqs, /never 911/);
  assert.match(faqs, /5 VERIFIED \+ 2 UNDER TEST/);
  assert.match(faqs, /tracked with product/);
  assert.doesNotMatch(faqs, /relatedHref/);

  assert.match(home, /<ObjectionFaq/);
  assert.match(hiw, /<ObjectionFaq/);
  assert.doesNotMatch(features, /ObjectionFaq/);
  assert.match(accordion, /name="mos-objection-faq"/);
  assert.match(accordion, /objection-faq/);
  assert.doesNotMatch(accordion, /Create from website/);
  assert.doesNotMatch(accordion, /Join launch list/);

  const homeCtaAfterFaq =
    home.indexOf("<ObjectionFaq") < home.indexOf("Join the list or start from your website");
  assert.equal(homeCtaAfterFaq, true);
  const hiwCtaAfterFaq =
    hiw.indexOf("<ObjectionFaq") < hiw.indexOf('secondaryLabel="Join launch list"');
  assert.equal(hiwCtaAfterFaq, true);
});

test("HonestyBanner token is shared and optional vignettes stay scenarios", () => {
  const banner = read("src/components/HonestyBanner.tsx");
  const home = read("src/app/page.tsx");
  const features = read("src/app/features/page.tsx");
  const vignettes = read("src/components/UkScenarioVignettes.tsx");

  assert.match(banner, /export function HonestyBanner/);
  assert.match(banner, /No ISO, SOC 2, or bank-grade claims/);
  assert.match(home, /<HonestyBanner/);
  assert.match(features, /<HonestyBanner compact/);
  assert.match(vignettes, /Scenario: leaky tap/);
  assert.match(vignettes, /Scenario: no heat/);
  assert.match(vignettes, /Scenario: 999 latch/);
  assert.doesNotMatch(vignettes, /testimonial|trusted by|customer quote/i);
});

test("static export setting is unchanged", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});
