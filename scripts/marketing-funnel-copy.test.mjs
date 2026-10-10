import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("how-it-works matches the /demo/ stepper labels", () => {
  const flow = read("src/components/HowItWorksFlow.tsx");
  const page = read("src/app/how-it-works/page.tsx");
  const create = [
    read("src/lib/onboarding-create.ts"),
    read("src/lib/onboarding-create-core.ts"),
  ].join("\n");

  assert.match(create, /label: "Website"/);
  assert.match(create, /label: "Check"/);
  assert.match(create, /label: "Configure"/);
  assert.match(create, /label: "Review & Try"/);

  assert.match(flow, /CREATE_JOURNEY_STEPS/);

  assert.match(flow, /Website → Check → Choose → Configure → Review & Try/);
  assert.match(flow, /missing hours, services, or FAQs stay empty/i);
  assert.match(flow, /browser voice receptionist is available after review/i);
  assert.match(flow, /not a live public telephone call/i);

  assert.doesNotMatch(flow, /always-on service/);

  assert.match(page, /Website → Check → Choose → Configure → Review & Try/);
  assert.match(page, /browser voice receptionist/i);
  assert.match(page, /live phone number|live public phone number/);
  assert.match(page, /<CtaPair/);
  assert.match(page, /funnelPageMetadata\("howItWorks"\)/);
  assert.match(page, /id="product-tour"/);
  assert.match(page, /<ProductTour/);
  assert.match(page, /not a live public phone number/i);
  assert.doesNotMatch(page, /commercially generally available/i);
});

test("features page renders inventory-driven VERIFIED / PREVIEW cards", () => {
  const page = read("src/app/features/page.tsx");
  const config = read("src/config/phone-ai-features.ts");
  const copy = [page, config].join("\n");
  assert.doesNotMatch(page, /phoneAiNotClaimed/);
  assert.doesNotMatch(page, /Explore all gaps/);
  assert.match(page, /FeatureStatusChip/);
  assert.match(page, /UNDER_TEST_GROUP_HONESTY/);
  assert.match(page, /marketingCardsByGroup/);
  assert.match(copy, /Website → Check → Choose → Configure → Review & Try/);
  assert.match(page, /<CtaPair/);
  assert.match(page, /funnelPageMetadata\("features"\)/);
  assert.match(page, /VERIFIED/);
  assert.match(page, /PREVIEW/);
  assert.match(config, /id: "M-ONB-01"/);
  assert.match(config, /id: "M-TEL-03"/);
  assert.match(config, /MARKETING_CARD_HARD_COUNT/);
  assert.match(config, /browser demo exists today/);
  assert.doesNotMatch(config, /id: "M-TEL-04"/);
  assert.doesNotMatch(config, /id: "M-CAL-01"/);
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
  assert.match(page, /<CtaPair/);
  assert.match(page, /no live phone demo/i);
  assert.match(page, /funnelPageMetadata\("home"\)/);
  assert.match(page, /ProductTourWatchLink/);
  assert.match(page, /HomeTrustStrip/);
  assert.match(page, /HomeRoleChips/);
  assert.match(page, /ObjectionFaq/);
  assert.doesNotMatch(page, /<video/);
  assert.doesNotMatch(page, /Property maintenance operations for UK landlords/);
});

test("Fonio matrix records the current interactive funnel", () => {
  const matrix = read("docs/competitive/fonio-parity-matrix.md");
  assert.match(matrix, /Website marketing/);
  assert.match(matrix, /Were lagging/);

  assert.match(matrix, /Review & Try/);
  assert.match(matrix, /optional save/);
  assert.match(matrix, /interactive browser receptionist preview/);
  assert.match(matrix, /hosted onboarding-scan companion is retired/);
  assert.match(matrix, /missing business details stay blank/);
  assert.match(matrix, /VERIFIED \/ PREVIEW/);
  assert.match(matrix, /live telephony remains separately commissioned/i);
  assert.match(matrix, /llms\.txt \/ llms-full\.txt vs \/create funnel/);
  assert.match(matrix, /FAQ \+ FAQPage JSON-LD vs \/create funnel/);
  assert.match(matrix, /not a live (public )?phone/i);

});

test("cookies stay DRAFT-honest with cookieless first-party measurement only", () => {
  const page = read("src/app/cookies/page.tsx");
  const stub = read("src/components/CookieSettingsStub.tsx");
  const privacy = read("src/app/privacy/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const faqPage = read("src/app/faq/page.tsx");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const measurement = read("src/lib/measurement.ts");
  const nextConfig = read("next.config.ts");

  assert.match(page, /DRAFT FOR LEGAL REVIEW|LegalDraftBanner/);
  assert.match(page, /Cookie Policy \(Draft\)/);
  assert.match(page, /no site-wide consent banner/i);
  assert.match(page, /No analytics cookie or third-party analytics tag/);
  assert.match(page, /cookieless operational measurement/);
  assert.match(page, /no browser storage|uses no cookies/);
  assert.match(page, /persistent visitor identifier/);
  assert.match(page, /not a Google Analytics, PECR,[\s\S]*GDPR[\s\S]*compliance certification/i);
  assert.match(page, /\/privacy\/#website-url-ingest/);
  assert.match(page, /href="\/privacy\/"/);
  assert.doesNotMatch(page, /prepared but inactive/i);
  assert.doesNotMatch(page, /Google Analytics certified|PECR compliant|GDPR compliant/i);

  assert.match(stub, /No site-wide banner/);
  assert.match(stub, /Cookieless first-party operational measurement/);
  assert.match(stub, /does not set\s+a visitor identifier/);
  assert.doesNotMatch(stub, /gtag|googletagmanager/i);

  assert.match(privacy, /No analytics or marketing cookies/);
  assert.match(privacy, /First-party operational measurement is cookieless/);
  assert.match(privacy, /No third-party analytics vendor is used/);
  assert.match(privacy, /Cookie Policy \(Draft\)/);

  assert.match(faqs, /question: "Do you use cookies or a consent banner\?"/);
  assert.match(faqs, /no site-wide cookie or consent banner/i);
  assert.match(faqs, /cookieless first-party operational measurement/);
  assert.match(faqs, /no persistent visitor identifier/);
  assert.match(faqs, /not a Google Analytics, PECR, or GDPR compliance certification/);
  assert.match(
    faqs,
    /question: "Do you use cookies or a consent banner\?"[\s\S]*relatedHref: "\/cookies\/"/,
  );
  assert.match(faqs, /Privacy, cookies, and terms remain DRAFT FOR LEGAL REVIEW/);

  assert.match(faqPage, /cookies/);

  assert.match(llms, /no analytics or marketing cookies/);
  assert.match(llms, /no third-party analytics tag/);
  assert.match(llms, /cookieless first-party aggregate measurement/);
  assert.match(llmsFull, /no analytics or marketing cookies/);
  assert.match(llmsFull, /no third-party analytics tag/);
  assert.match(llmsFull, /cookieless first-party aggregate measurement/);

  assert.doesNotMatch(measurement, /document\.cookie|window\.localStorage|window\.sessionStorage|globalThis\.localStorage/);
  assert.doesNotMatch(measurement, /gtag|googletagmanager|posthog|mixpanel|segment|amplitude/i);
  assert.match(nextConfig, /output:\s*["']export["']/);
});

test("security stays claims-safe with bounded website learning and no cert theatre", () => {
  const page = read("src/app/security/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const features = [
    read("src/app/features/page.tsx"),
    read("src/config/phone-ai-features.ts"),
  ].join("\n");
  const home = [
    read("src/app/page.tsx"),
    read("src/components/HonestyBanner.tsx"),
  ].join("\n");
  const flow = read("src/components/HowItWorksFlow.tsx");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const nextConfig = read("next.config.ts");

  assert.match(page, /<CtaPair/);
  assert.doesNotMatch(page, /primaryLabel="Create from website"/);
  assert.match(page, /Website learning reads only a small, bounded set of public HTTPS/);
  assert.match(page, /private\/internal addresses[\s\S]*blocked/);
  assert.match(page, /No ISO 27001, SOC 2/);
  assert.match(page, /No bank-grade/);
  assert.match(page, /DRAFT FOR LEGAL REVIEW/);
  assert.match(page, /Product interest starts at Request an early demo/);
  assert.doesNotMatch(page, /bank-grade security we provide/i);
  assert.doesNotMatch(page, /ISO 27001 certified/i);
  assert.doesNotMatch(page, /SOC 2 Type/i);

  assert.match(faqs, /question: "Are you ISO or SOC 2 certified\?"/);
  assert.match(faqs, /bank-grade security/);

  assert.match(faqs, /Website learning is read-only, bounded and SSRF-guarded/);

  assert.match(faqs, /DRAFT FOR LEGAL REVIEW/);
  assert.match(
    faqs,
    /question: "Are you ISO or SOC 2 certified\?"[\s\S]*relatedHref: "\/demo\/"/,
  );


  assert.match(features, /bounded, read-only website learning/i);
  assert.match(features, /bank-grade/);
  assert.match(home, /No ISO, SOC 2, or bank-grade claims/);
  assert.match(flow, /Website learning is read-only, bounded, robots-aware and SSRF-guarded/i);
  assert.match(flow, /Extracted facts are reviewable/i);


  assert.match(llms, /website learning is bounded, read-only and SSRF-guarded/i);
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

  assert.match(page, /<LeadCaptureForm/);
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
    /question: "How do I contact you\?"[\s\S]*relatedHref: "\/demo\/"/,
  );

  assert.match(llms, /not a GA support desk/);
  assert.match(llms, /no invented SLA/);
  assert.match(llmsFull, /Contact form for genuine human enquiries/);
  assert.match(llmsFull, /no invented SLA/);
  assert.match(nextConfig, /output:\s*["']export["']/);
});

test("pricing stays claims-safe with early demo CTA and coming telephony/calendar", () => {
  const config = read("src/config/pricing.ts");
  const page = read("src/app/pricing/page.tsx");
  const faqs = read("src/content/faqs.ts");
  const llms = read("public/llms.txt");
  const llmsFull = read("public/llms-full.txt");
  const nextConfig = read("next.config.ts");

  assert.match(config, /href: "\/demo\/"/);
  assert.match(config, /label: "Request an early demo"/);
  assert.match(config, /coming \/ early access/);
  assert.match(config, /calendar booking/);
  assert.match(config, /No live phone is included in a plan/);
  assert.match(config, /tiers: \[\] as PricingTier\[\]/);
  assert.doesNotMatch(config, /£/);
  assert.doesNotMatch(config, /generally available product/i);
  assert.doesNotMatch(config, /commercially generally available/i);

  assert.match(page, /<CtaPair/);
  assert.match(page, /not a live (public )?phone/i);
  assert.match(page, /not general availability/);
  assert.match(page, /No live phone in a plan/);
  assert.doesNotMatch(page, /£/);

  assert.match(faqs, /no live phone included in a plan/);
  assert.match(faqs, /Live telephony and calendar booking are coming \/ early access/);
  assert.match(
    faqs,
    /question: "When will pricing be published\?"[\s\S]*relatedHref: "\/demo\/"/,
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
    /website URL .* website learning .* review .* configure .* browser voice preview .* optional save/,
  );
  assert.match(faqs, /not a live (public )?phone/);
  assert.match(faqs, /no instant live number/);
  assert.match(faqs, /no public always-on receptionist/);

  assert.match(faqs, /read(s)? a small, bounded set of public HTTPS pages/i);
  assert.match(faqs, /missing facts stay empty rather than being invented/i);
  assert.match(faqs, /robots\.txt is honoured/);

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
    /website URL .* website learning .* review .* configure .* browser voice preview .* optional save/,
  );
  assert.match(page, /Not a live (public )?phone/);
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
  assert.match(page, /Review &amp; Try/);
  assert.match(page, /website URL → check → choose role → configure → review/);
  assert.match(page, /optional save/);
  assert.match(page, /<CtaPair/);
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

test("create and legal scaffolds share the website-URL setup privacy note", () => {
  const copy = read("src/lib/create-ingest-privacy.ts");
  const note = read("src/components/CreateIngestPrivacyNote.tsx");
  const page = read("src/app/create/page.tsx");
  const privacy = read("src/app/privacy/page.tsx");
  const cookies = read("src/app/cookies/page.tsx");
  const terms = read("src/app/terms/page.tsx");
  const chrome = read("src/components/LegalPageChrome.tsx");
  const config = read("next.config.ts");

  assert.match(copy, /CREATE_INGEST_PRIVACY_NOTE/);
  assert.match(copy, /reads a small, bounded set of public HTTPS pages/);
  assert.match(copy, /Private and internal network targets are blocked/);
  assert.match(copy, /robots\.txt is honoured/);
  assert.match(copy, /only stored when you choose Save setup/);
  assert.match(copy, /browser voice preview does not activate or alter live telephony/);
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
  assert.match(terms, /website learning reads a small, bounded set of public HTTPS pages/i);
  assert.match(terms, /browser voice preview does not activate live telephony/i);
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

test("primary conversion CTAs point at /demo/, not a live phone demo", () => {
  const pair = read("src/components/CtaPair.tsx");
  const header = read("src/components/SiteHeader.tsx");
  const home = read("src/app/page.tsx");
  const industries = read("src/components/IndustryRolePage.tsx");

  assert.match(pair, /primaryHref = "\/demo\/"/);
  assert.match(pair, /secondaryHref = "\/how-we-keep-control\/"/);
  assert.match(header, /href="\/demo\/"/);
  assert.match(header, /Request an early demo/);
  assert.doesNotMatch(header, /See it live/i);
  assert.match(home, /primaryHref="\/demo\/"/);
  assert.match(industries, /primaryHref="\/demo\/"/);
  assert.match(industries, /secondaryHref="\/how-we-keep-control\/"/);
});
