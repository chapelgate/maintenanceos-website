import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const FORBIDDEN = [
  /beats Fonio/i,
  /10,000\+ Customers/i,
  /SOC\s*2 Type/i,
  /ISO 27001 certified/i,
  /call this number to hear/i,
  /go live in 30/i,
  /always-on phone line is live/i,
];

test("home commercial pass keeps Create/Join hierarchy and 3-step start", () => {
  const home = read("src/app/page.tsx");
  const steps = read("src/components/HomeOnboardingSteps.tsx");
  const strip = read("src/components/HomeTrustStrip.tsx");

  assert.match(home, /UK maintenance operations\. AI intake\. Rules keep control\./);
  assert.match(home, /HomeOnboardingSteps/);
  assert.match(home, /primaryHref="\/create\/"/);
  assert.match(home, /secondaryLabel="Request early access"/);
  assert.match(home, /id="home-why-heading"/);
  assert.match(home, /<h3 className="text-xl font-semibold tracking-tight text-ink/);

  assert.match(steps, /How to start — three steps/);
  assert.match(steps, /Website/);
  assert.match(steps, /Review pack/);
  assert.match(steps, /Early access/);
  assert.match(steps, /FeatureStatusChip status="UNDER_TEST"/);
  assert.match(steps, /href: "\/create\/"/);
  assert.doesNotMatch(steps, /go live/i);
  assert.doesNotMatch(steps, /30 seconds/i);

  assert.match(strip, /home-trust-chip/);
  assert.match(strip, /No live phone on this site/);
  assert.doesNotMatch(strip, /trustpilot|logo wall|award/i);
});

test("funnel pages share one primary path strip", () => {
  const strip = read("src/components/FunnelPathStrip.tsx");
  assert.match(strip, /One public path/);
  assert.match(strip, /Website → Check → Review → Pack → optional sandbox → early access/);
  assert.match(strip, /href="\/create\/"/);
  assert.match(strip, /does not assign a live phone number/);

  for (const file of [
    "src/app/create/page.tsx",
    "src/app/demo/page.tsx",
    "src/app/pricing/page.tsx",
    "src/app/contact/page.tsx",
    "src/app/faq/page.tsx",
    "src/app/features/page.tsx",
    "src/app/how-it-works/page.tsx",
  ]) {
    const src = read(file);
    assert.match(src, /FunnelPathStrip/, `${file} should reuse FunnelPathStrip`);
  }
});

test("pricing stays request-pricing with conceptual inclusions and no invented figures", () => {
  const page = read("src/app/pricing/page.tsx");
  const config = read("src/config/pricing.ts");
  assert.match(page, /Designed to include/);
  assert.match(page, /Not sold as live yet/);
  assert.match(page, /Request pricing/);
  assert.match(page, /No live phone in a plan/);
  assert.match(config, /Launching soon/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(config, /£/);
  assert.doesNotMatch(page, /Most Popular/);
  assert.doesNotMatch(page, /\$49/);
});

test("demo ladder does not imply a live always-on DID", () => {
  const page = read("src/app/demo/page.tsx");
  assert.match(page, /FeatureStatusChip/);
  assert.match(page, /What this is not/);
  assert.match(page, /Not a self-serve “call our AI now”/);
  assert.match(page, /does not assign a live number/);
  assert.doesNotMatch(page, /call \+/);
  assert.doesNotMatch(page, /DID/);
  assert.doesNotMatch(page, /always-on live phone/i);
});

test("contact, about, and faq stay professional and claims-safe", () => {
  const contact = read("src/app/contact/page.tsx");
  const about = read("src/app/about/page.tsx");
  const faq = read("src/app/faq/page.tsx");

  assert.match(contact, /Talk to a person/);
  assert.match(contact, /Choose the right path/);
  assert.match(contact, /not a GA support desk/);
  assert.match(contact, /no invented response SLA/);
  assert.doesNotMatch(contact, /we reply within/i);
  assert.doesNotMatch(contact, /call us on/i);

  assert.match(about, /Chapelgate/);
  assert.match(about, /United Kingdom/);
  assert.match(about, /do not invent team bios/);
  assert.doesNotMatch(about, /our team of \d+/i);
  assert.doesNotMatch(about, /trusted by/i);

  assert.match(faq, /name="mos-site-faq"/);
  assert.match(faq, /Not a live phone/);
});

test("features inventory uses compact cards with searchable details", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /feature-learn-more/);
  assert.match(page, /Learn more/);
  assert.match(page, /<FeatureStatusChip status=\{card\.status\}/);
  assert.match(page, /md:grid-cols-2/);
});

test("SEO helper stays funnel-aligned and claims-safe", () => {
  const meta = read("src/lib/page-meta.ts");
  assert.match(meta, /website to knowledge pack/);
  assert.match(meta, /FUNNEL_PATH_LABEL/);
  assert.match(meta, /not a live phone/);
  assert.match(meta, /not always-on/);
  assert.match(meta, /not general availability/);
  assert.doesNotMatch(meta, /24\/7/);
  assert.doesNotMatch(meta, /Create your AI receptionist/);
});

test("layout skip target is focusable and export stays static", () => {
  const layout = read("src/app/layout.tsx");
  const config = read("next.config.ts");
  assert.match(layout, /id="main"/);
  assert.match(layout, /tabIndex=\{-1\}/);
  assert.match(config, /output:\s*["']export["']/);
});

test("commercial pages do not introduce forbidden peer-copy claims", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/pricing/page.tsx",
    "src/app/demo/page.tsx",
    "src/app/create/page.tsx",
    "src/app/contact/page.tsx",
    "src/app/about/page.tsx",
    "src/app/faq/page.tsx",
    "src/app/features/page.tsx",
    "src/components/HomeOnboardingSteps.tsx",
    "src/components/HomeTrustStrip.tsx",
    "src/components/UkScenarioVignettes.tsx",
    "src/components/FunnelPathStrip.tsx",
  ];
  for (const file of files) {
    const src = read(file);
    for (const pattern of FORBIDDEN) {
      assert.doesNotMatch(src, pattern, `${file} matched ${pattern}`);
    }
  }
});
