import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("how-it-works matches the /create stepper labels", () => {
  const flow = read("src/components/HowItWorksFlow.tsx");
  const page = read("src/app/how-it-works/page.tsx");
  const create = [
    read("src/lib/onboarding-create.ts"),
    read("src/lib/onboarding-create-core.ts"),
  ].join("\n");

  assert.match(create, /label: "Website"/);
  assert.match(create, /label: "Check"/);
  assert.match(create, /label: "Review"/);
  assert.match(create, /label: "Pack"/);

  assert.match(flow, /CREATE_JOURNEY_STEPS/);
  assert.match(flow, /Website → Check → Review → Pack/);
  assert.match(flow, /do not invent extracted hours/);
  assert.match(flow, /scripted sandbox demo is under testing/);
  assert.match(flow, /not a live customer call/i);
  assert.doesNotMatch(flow, /always-on service/);

  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /scripted sandbox/);
  assert.match(page, /live phone number/);
  assert.match(page, /Create from website/);
  assert.match(page, /funnelPageMetadata\("howItWorks"\)/);
  assert.match(page, /id="product-tour"/);
  assert.match(page, /<ProductTour/);
  assert.match(page, /not a live phone demo/i);
  assert.doesNotMatch(page, /commercially generally available/i);
});

test("features page renders inventory-driven VERIFIED / UNDER TEST cards", () => {
  const page = read("src/app/features/page.tsx");
  const config = read("src/config/phone-ai-features.ts");
  const copy = [page, config].join("\n");
  assert.match(page, /phoneAiNotClaimed/);
  assert.match(page, /marketingCardsByGroup/);
  assert.match(copy, /Website → Check → Review → Pack/);
  assert.match(page, /Create from website/);
  assert.match(page, /Join launch list/);
  assert.match(page, /funnelPageMetadata\("features"\)/);
  assert.match(page, /VERIFIED/);
  assert.match(page, /UNDER TEST/);
  assert.match(config, /id: "M-ONB-01"/);
  assert.match(config, /Pack-aware scripted sandbox/);
  assert.match(config, /Calendar connect/);
  assert.match(config, /Not a live receptionist or a 30-second phone number/);
  assert.doesNotMatch(page, /heading: "HAVE"/);
  assert.doesNotMatch(page, /heading: "COMING"/);
  assert.doesNotMatch(page, /commercially generally available/i);
  assert.doesNotMatch(page, /beats Fonio/i);
});

test("static export setting is unchanged", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});

test("home CTA strip names the website-to-pack path", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /website URL/);
  assert.match(page, /knowledge pack/);
  assert.match(page, /scripted sandbox/);
  assert.match(page, /Create from website/);
  assert.match(page, /No live phone demo/);
  assert.match(page, /funnelPageMetadata\("home"\)/);
  assert.match(page, /ProductTourWatchLink/);
  assert.doesNotMatch(page, /<video/);
  assert.doesNotMatch(page, /Property maintenance operations for UK landlords/);
});

test("Fonio matrix notes marketing pages had lagged the create funnel", () => {
  const matrix = read("docs/competitive/fonio-parity-matrix.md");
  assert.match(matrix, /Were lagging/);
  assert.match(matrix, /Website → Check → Review → Pack/);
  assert.match(matrix, /HAVE \/ UNDER TEST \/ COMING/);
  assert.match(matrix, /narrative aligned; still not a live phone/);
  assert.match(matrix, /Demo \/ “see it live” CTAs vs `\/create` funnel/);
  assert.match(matrix, /demo CTAs aligned; still not a live phone/);
  assert.match(matrix, /SEO titles \/ descriptions \/ OG vs `\/create` funnel/);
  assert.match(matrix, /SEO meta aligned; still not a live phone/);
  assert.match(matrix, /JSON-LD on home \+ funnel pages/);
  assert.match(matrix, /claims-safe JSON-LD; still not a live phone/);
  assert.match(matrix, /llms\.txt \/ llms-full\.txt vs `\/create` funnel/);
  assert.match(matrix, /llms files aligned; still not a live phone/);
  assert.match(matrix, /FAQ \+ FAQPage JSON-LD vs `\/create` funnel/);
  assert.match(matrix, /FAQ aligned; still not a live phone/);
  assert.match(matrix, /Privacy note vs `\/create` website-URL ingest/);
  assert.match(matrix, /privacy note aligned; still not live telephony data/);
  assert.match(matrix, /Pricing page clarity/);
  assert.match(matrix, /pricing copy aligned; still not published list prices/);
  assert.match(matrix, /Contact \/ enquiry CTAs vs `\/create` funnel/);
  assert.match(matrix, /contact copy aligned; still not a support desk/);
  assert.match(matrix, /Security \/ trust marketing vs certifications/);
  assert.match(matrix, /security copy aligned; still not certified/);
  assert.match(matrix, /Cookie \/ consent banner vs analytics/);
  assert.match(matrix, /cookies copy aligned; still DRAFT, still no analytics/);
});

test("cookies stay DRAFT-honest with no banner, no invented analytics, no GA cert", () => {
  const page = read("src/app/cookies/page.tsx");
  const stub = read("src/components/CookieSettingsStub.tsx");
  const privacy = read("src/app/privacy/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const faqPage = read("src/app/faq/page.tsx");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const nextConfig = read("next.config.ts");

  assert.match(page, /DRAFT FOR LEGAL REVIEW|LegalDraftBanner/);
  assert.match(page, /Cookie Policy \(Draft\)/);
  assert.match(page, /no site-wide consent banner/i);
  assert.match(page, /None currently — no vendor, no tags/);
  assert.match(page, /If added later, off\s+until consent/);
  assert.match(page, /not a Google Analytics, PECR,\s+or GDPR compliance certification/i);
  assert.match(page, /\/privacy\/#website-url-ingest/);
  assert.match(page, /href="\/privacy\/"/);
  assert.doesNotMatch(page, /prepared but inactive/i);
  assert.doesNotMatch(page, /aligned with MOS Privacy/i);
  assert.doesNotMatch(page, /agreed with MOS Privacy/i);
  assert.doesNotMatch(page, /Active as implemented/i);
  assert.doesNotMatch(page, /Google Analytics certified/i);
  assert.doesNotMatch(page, /PECR compliant/i);
  assert.doesNotMatch(page, /GDPR compliant/i);

  assert.match(stub, /No site-wide banner/);
  assert.match(stub, /Consent UI TBD/);
  assert.match(
    stub,
    /not a Google\s+Analytics, PECR, or GDPR compliance certification/i,
  );
  assert.doesNotMatch(stub, /gtag|googletagmanager/i);

  assert.match(privacy, /No analytics or marketing tags are loaded today/);
  assert.match(privacy, /Cookie Policy \(Draft\)/);

  assert.match(faqs, /question: "Do you use cookies or a consent banner\?"/);
  assert.match(faqs, /no site-wide cookie or consent banner/i);
  assert.match(faqs, /No analytics or marketing tags are loaded/);
  assert.match(faqs, /not a Google Analytics, PECR, or GDPR compliance certification/);
  assert.match(
    faqs,
    /question: "Do you use cookies or a consent banner\?"[\s\S]*relatedHref: "\/cookies\/"/,
  );
  assert.match(faqs, /Privacy, cookies, and terms are DRAFT FOR LEGAL REVIEW/);

  assert.match(faqPage, /cookies/);

  assert.match(llms, /no site-wide consent banner/);
  assert.match(llms, /no analytics or marketing tags today/);
  assert.match(llms, /not a Google Analytics \/ PECR \/ GDPR compliance certification/);
  assert.match(llmsFull, /no site-wide consent banner/);
  assert.match(llmsFull, /no analytics or marketing tags today/);
  assert.match(llmsFull, /not a GA \/ PECR \/ GDPR compliance certification/);
  assert.match(nextConfig, /output:\s*["']export["']/);
});

test("security stays claims-safe with SSRF-safe scan and no cert theatre", () => {
  const page = read("src/app/security/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const features = [
    read("src/app/features/page.tsx"),
    read("src/config/phone-ai-features.ts"),
  ].join("\n");
  const home = read("src/app/page.tsx");
  const flow = read("src/components/HowItWorksFlow.tsx");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const nextConfig = read("next.config.ts");

  assert.match(page, /primaryHref="\/create\/"/);
  assert.match(page, /Create from website/);
  assert.match(page, /SSRF-safe/);
  assert.match(page, /not a live knowledge crawl/);
  assert.match(page, /No ISO 27001, SOC 2/);
  assert.match(page, /No bank-grade/);
  assert.match(page, /DRAFT FOR LEGAL REVIEW/);
  assert.match(page, /Product interest starts at Create from website/);
  assert.doesNotMatch(page, /bank-grade security we provide/i);
  assert.doesNotMatch(page, /ISO 27001 certified/i);
  assert.doesNotMatch(page, /SOC 2 Type/i);

  assert.match(faqs, /question: "Are you ISO or SOC 2 certified\?"/);
  assert.match(faqs, /bank-grade security/);
  assert.match(faqs, /SSRF-safe and under test/);
  assert.match(faqs, /DRAFT FOR LEGAL REVIEW/);
  assert.match(
    faqs,
    /question: "Are you ISO or SOC 2 certified\?"[\s\S]*relatedHref: "\/create\/"/,
  );

  assert.match(features, /SSRF-safe website scan companion/);
  assert.match(features, /bank-grade/);
  assert.match(home, /No ISO, SOC 2, or bank-grade claims/);
  assert.match(flow, /SSRF-safe companion/);
  assert.match(flow, /not a live knowledge crawl/);

  assert.match(llms, /SSRF-safe scan under test/);
  assert.match(llms, /no ISO\/SOC 2 or bank-grade claims/);
  assert.match(llms, /legal pages are DRAFT/);
  assert.match(llmsFull, /## Security/);
  assert.match(llmsFull, /bank-grade claims/);
  assert.match(llmsFull, /DRAFT FOR LEGAL REVIEW/);
  assert.match(nextConfig, /output:\s*["']export["']/);
});

test("contact stays claims-safe as human enquiry, not a support desk", () => {
  const page = read("src/app/contact/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const nextConfig = read("next.config.ts");

  assert.match(page, /href="\/create\/"/);
  assert.match(page, /Create from website/);
  assert.match(page, /not live phone provisioning/);
  assert.match(page, /not a GA support desk/);
  assert.match(page, /no invented (response )?SLA/);
  assert.match(page, /leadType="contact"/);
  assert.doesNotMatch(page, /we reply within/i);
  assert.doesNotMatch(page, /support ticket/i);
  assert.doesNotMatch(page, /call us on/i);

  assert.match(faqs, /question: "How do I contact you\?"/);
  assert.match(faqs, /not a GA support desk/);
  assert.match(faqs, /not an invented SLA/);
  assert.match(
    faqs,
    /question: "How do I contact you\?"[\s\S]*relatedHref: "\/create\/"/,
  );

  assert.match(llms, /not a GA support desk/);
  assert.match(llms, /no invented SLA/);
  assert.match(llmsFull, /Contact form for genuine human enquiries/);
  assert.match(llmsFull, /no invented SLA/);
  assert.match(nextConfig, /output:\s*["']export["']/);
});

test("pricing stays claims-safe with Create CTA and coming telephony/calendar", () => {
  const config = read("src/config/pricing.ts");
  const page = read("src/app/pricing/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const nextConfig = read("next.config.ts");

  assert.match(config, /href: "\/create\/"/);
  assert.match(config, /label: "Create from website"/);
  assert.match(config, /coming \/ early access/);
  assert.match(config, /calendar booking/);
  assert.match(config, /No live phone is included in a plan/);
  assert.match(config, /tiers: \[\] as PricingTier\[\]/);
  assert.doesNotMatch(config, /£/);
  assert.doesNotMatch(config, /generally available product/i);
  assert.doesNotMatch(config, /commercially generally available/i);

  assert.match(page, /primaryHref=\{pricing\.primaryCta\.href\}/);
  assert.match(page, /Create from website/);
  assert.match(page, /not a live phone/);
  assert.match(page, /not general availability/);
  assert.match(page, /No live phone in a plan/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /Request pricing or join the launch list/);

  assert.match(faqs, /no live phone included in a plan/);
  assert.match(faqs, /Live telephony and calendar booking are coming \/ early access/);
  assert.match(
    faqs,
    /question: "When will pricing be published\?"[\s\S]*relatedHref: "\/create\/"/,
  );

  assert.match(llms, /No live phone in a plan/);
  assert.match(llms, /telephony and calendar are coming \/ early access/);
  assert.match(llmsFull, /no live phone included in a plan/);
  assert.match(llmsFull, /No invented £ figures/);
  assert.match(nextConfig, /output:\s*["']export["']/);
});

test("FAQ copy names the verified funnel and stays claims-safe", () => {
  const faqs = read("src/content/faqs.ts");
  const page = read("src/app/faq/page.tsx");

  assert.match(
    faqs,
    /website URL → check → review → pack → optional scripted sandbox → early access/,
  );
  assert.match(faqs, /not a live phone/);
  assert.match(faqs, /no instant live number/);
  assert.match(faqs, /no public always-on receptionist/);
  assert.match(faqs, /crawl is queued/);
  assert.match(faqs, /do not invent extracted hours/);
  assert.match(faqs, /owner-blocked/);
  assert.match(faqs, /Empty hours and services stay empty/);
  assert.match(faqs, /999 guidance \(never 911\)/);
  assert.match(faqs, /not commercially generally available/);
  assert.match(faqs, /How do I contact you\?/);
  assert.match(faqs, /not a GA support desk/);
  assert.match(faqs, /Do you use cookies or a consent banner\?/);
  assert.match(faqs, /no site-wide cookie or consent banner/);
  assert.doesNotMatch(faqs, /always-on phone line is live/i);
  assert.doesNotMatch(faqs, /your number is ready/i);
  assert.doesNotMatch(faqs, /commercially generally available now/i);

  assert.match(page, /faqItems/);
  assert.match(page, /faqPageJsonLd\(\)/);
  assert.match(
    page,
    /website URL → check → review → pack → optional scripted sandbox → early access/,
  );
  assert.match(page, /Not a live phone/);
  assert.doesNotMatch(page, /commercially generally available now/i);
});

test("demo page names the website-to-pack path and does not book a live phone", () => {
  const page = read("src/app/demo/page.tsx");
  const tabs = read("src/components/DemoConversionTabs.tsx");
  const create = [
    read("src/lib/onboarding-create.ts"),
    read("src/lib/onboarding-create-core.ts"),
  ].join("\n");

  assert.match(create, /label: "Website"/);
  assert.match(page, /CREATE_JOURNEY_STEPS/);
  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /website URL → check → review draft → knowledge pack/);
  assert.match(page, /optional scripted sandbox/);
  assert.match(page, /Create from website/);
  assert.match(page, /live number/);
  assert.match(page, /funnelPageMetadata\("demo"\)/);
  assert.doesNotMatch(page, /See MaintenanceOS/);
  assert.doesNotMatch(page, /Book a product walkthrough/);
  assert.doesNotMatch(page, /Book a MaintenanceOS/);
  assert.doesNotMatch(page, /commercially generally available/i);

  assert.match(tabs, /Request early access/);
  assert.match(tabs, /not live number provisioning/);
  assert.match(tabs, /leadType="early_demo"/);
});

test("create page metadata comes from the shared funnel helper", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /funnelPageMetadata\("create"\)/);
  assert.doesNotMatch(page, /Create your AI receptionist/);
});

test("create and legal scaffolds share the website-URL ingest privacy note", () => {
  const copy = read("src/lib/create-ingest-privacy.ts");
  const note = read("src/components/CreateIngestPrivacyNote.tsx");
  const page = read("src/app/create/page.tsx");
  const privacy = read("src/app/privacy/page.tsx");
  const cookies = read("src/app/cookies/page.tsx");
  const terms = read("src/app/terms/page.tsx");
  const chrome = read("src/components/LegalPageChrome.tsx");
  const config = read("next.config.ts");

  assert.match(copy, /CREATE_INGEST_PRIVACY_NOTE/);
  assert.match(copy, /public pages from the website URL you submit may be fetched/);
  assert.match(copy, /do not invent crawl results/);
  assert.match(copy, /Lead email is for early access only/);
  assert.match(copy, /not live telephony data processing/);
  assert.match(copy, /DRAFT FOR LEGAL REVIEW/);
  assert.doesNotMatch(
    copy,
    /export const CREATE_INGEST_PRIVACY_NOTE =[\s\S]*?\bDPO\b/,
  );
  assert.doesNotMatch(
    copy,
    /export const CREATE_INGEST_PRIVACY_NOTE =[\s\S]*data protection officer/i,
  );
  assert.doesNotMatch(
    copy,
    /export const CREATE_INGEST_PRIVACY_NOTE =[\s\S]*GDPR compliant/i,
  );

  assert.doesNotMatch(note, /^["']use client["']/);
  assert.match(note, /CREATE_INGEST_PRIVACY_NOTE/);
  assert.match(note, /\/privacy\/#\$\{CREATE_INGEST_PRIVACY_ANCHOR\}/);

  assert.match(page, /CreateIngestPrivacyNote/);
  assert.match(privacy, /CREATE_INGEST_PRIVACY_NOTE/);
  assert.match(privacy, /CREATE_INGEST_PRIVACY_ANCHOR/);
  assert.match(privacy, /id=\{s\.id\}/);
  assert.match(cookies, /\/privacy\/#website-url-ingest/);
  assert.match(cookies, /not a cookie category/);
  assert.match(terms, /lead email for early access only/);
  assert.match(terms, /not live telephony data/);
  assert.match(chrome, /\/create early-access/);
  assert.match(config, /output:\s*["']export["']/);
  for (const [label, src] of [
    ["create page", page],
    ["privacy page", privacy],
    ["cookies page", cookies],
    ["terms page", terms],
    ["legal chrome", chrome],
    ["create note", note],
  ]) {
    assert.doesNotMatch(src, /\bDPO\b/, `${label} must not invent a DPO`);
    assert.doesNotMatch(
      src,
      /data protection officer/i,
      `${label} must not invent a data protection officer`,
    );
    assert.doesNotMatch(
      src,
      /GDPR compliant/i,
      `${label} must not claim GDPR compliance`,
    );
  }
});

test("primary conversion CTAs point at /create, not a live phone demo", () => {
  const pair = read("src/components/CtaPair.tsx");
  const header = read("src/components/SiteHeader.tsx");
  const home = read("src/app/page.tsx");
  const industries = read("src/components/IndustryRolePage.tsx");

  assert.match(pair, /primaryHref = "\/create\/"/);
  assert.match(pair, /secondaryHref = "\/demo\/#demo"/);
  assert.match(header, /href="\/create\/"/);
  assert.match(header, /Create from website/);
  assert.match(header, /Early access/);
  assert.doesNotMatch(header, /See it live/i);
  assert.match(home, /primaryHref="\/create\/"/);
  assert.match(industries, /primaryHref="\/create\/"/);
  assert.match(industries, /secondaryHref="\/demo\/#demo"/);
});
