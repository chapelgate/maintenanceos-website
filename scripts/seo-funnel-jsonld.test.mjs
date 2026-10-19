import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const FUNNEL_PAGES = {
  "src/app/page.tsx": "home",
  "src/app/create/page.tsx": "create",
  "src/app/demo/page.tsx": "demo",
  "src/app/how-it-works/page.tsx": "howItWorks",
  "src/app/features/page.tsx": "features",
  "src/app/property-maintenance-software/page.tsx": "propertyMaintenanceSoftware",
};

const FORBIDDEN_SCHEMA_KEYS = [
  "telephone",
  "aggregateRating",
  "review",
  "reviews",
  "offers",
  "offer",
  "ratingValue",
];

test("shared JSON-LD helper stays claims-safe and uses funnel copy", () => {
  const src = read("src/lib/json-ld.ts");
  assert.match(src, /export function marketingJsonLd/);
  assert.match(src, /export function funnelPageJsonLd/);
  assert.match(src, /export function fullFunnelPageJsonLd/);
  assert.match(src, /export function fullFaqPageJsonLd/);
  assert.match(src, /from ["']@\/lib\/page-meta["']/);
  assert.match(src, /funnelPageCopy/);
  assert.match(src, /"@type": "Organization"/);
  assert.match(src, /"@type": "WebSite"/);
  assert.match(src, /"@type": "WebPage"/);
  assert.match(src, /"@type": "SoftwareApplication"/);
  assert.match(src, /"@type": "FAQPage"/);
  assert.match(src, /"@type": "BreadcrumbList"/);
  assert.match(src, /name: "Chapelgate Technologies"/);
  assert.match(src, /siteConfig\.publicBrand/);
  assert.match(src, /alternateName/);
  assert.match(src, /Property maintenance operations software/);
  assert.match(src, /Not commercially generally available/);
  assert.match(src, /not a public always-on phone service/);
  assert.doesNotMatch(src, /PreOrder/);
  assert.doesNotMatch(src, /InStock/);
  assert.doesNotMatch(src, /aggregateRating/);
  assert.doesNotMatch(src, /ratingValue/);
  assert.doesNotMatch(src, /["']telephone["']\s*:/);
  assert.doesNotMatch(src, /offers:/);
  assert.doesNotMatch(src, /"@type": "Offer"/);
  assert.doesNotMatch(src, /24\/7/);
});

test("layout does not include JSON-LD (deduplicated to per-page)", () => {
  const layout = read("src/app/layout.tsx");
  assert.doesNotMatch(layout, /marketingJsonLd\(\)/);
  assert.doesNotMatch(layout, /funnelPageJsonLd/);
  assert.doesNotMatch(layout, /JsonLd/);
  assert.match(layout, /contentSecurityPolicy/);
});

test("home and key funnel pages emit fullFunnelPageJsonLd with BreadcrumbList", () => {
  for (const [file, key] of Object.entries(FUNNEL_PAGES)) {
    const src = read(file);
    assert.match(
      src,
      new RegExp(`fullFunnelPageJsonLd\\("${key}"\\)`),
      `${file} should render fullFunnelPageJsonLd("${key}")`,
    );
    assert.match(src, /from ["']@\/components\/JsonLd["']/);
  }
});

test("FAQ JSON-LD uses fullFaqPageJsonLd with BreadcrumbList", () => {
  const faqPage = read("src/app/faq/page.tsx");
  const helper = read("src/lib/json-ld.ts");
  const faqs = read("src/content/faqs.ts");
  assert.match(faqPage, /fullFaqPageJsonLd\(\)/);
  assert.match(helper, /export function fullFaqPageJsonLd/);
  assert.match(helper, /"@type": "FAQPage"/);
  assert.match(helper, /"@type": "BreadcrumbList"/);
  assert.match(helper, /from ["']@\/content\/faqs["']/);
  assert.match(helper, /faqItems\.map/);
  assert.doesNotMatch(helper, /aggregateRating/);

  assert.match(faqs, /browser receptionist preview|browser voice preview|interactive browser receptionist preview/);
  assert.match(faqs, /optional save/);
  assert.match(faqs, /small, bounded set of public HTTPS pages/i);

  assert.match(faqs, /Empty hours and services stay empty/);
  assert.match(faqs, /999 guidance \(never 911\)/);
  assert.doesNotMatch(faqs, /always-on phone line is live/i);
});

function collectKeys(value, into = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, into);
    return into;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      into.add(key);
      collectKeys(child, into);
    }
  }
  return into;
}

function parseJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    blocks.push(JSON.parse(match[1]));
  }
  return blocks;
}

test("exported funnel HTML has single claims-safe JSON-LD with BreadcrumbList when out/ exists", () => {
  const files = {
    "out/index.html": "home",
    "out/create/index.html": "create",
    "out/demo/index.html": "demo",
    "out/how-it-works/index.html": "howItWorks",
    "out/features/index.html": "features",
    "out/property-maintenance-software/index.html": "propertyMaintenanceSoftware",
  };
  const present = Object.keys(files).filter((rel) =>
    fs.existsSync(path.join(ROOT, rel)),
  );
  if (present.length === 0) {
    return;
  }

  for (const rel of present) {
    const html = read(rel);
    assert.match(html, /http-equiv="Content-Security-Policy"/);
    const blocks = parseJsonLdBlocks(html);
    assert.equal(blocks.length, 1, `${rel} should have exactly ONE JSON-LD block`);

    const types = new Set();
    const keys = new Set();
    for (const block of blocks) {
      collectKeys(block, keys);
      const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [block];
      for (const node of graph) {
        if (typeof node["@type"] === "string") types.add(node["@type"]);
      }
    }

    assert.ok(types.has("Organization"), `${rel} missing Organization`);
    assert.ok(types.has("WebSite"), `${rel} missing WebSite`);
    assert.ok(types.has("WebPage"), `${rel} missing WebPage`);
    assert.ok(
      types.has("SoftwareApplication"),
      `${rel} missing SoftwareApplication`,
    );
    assert.ok(types.has("BreadcrumbList"), `${rel} missing BreadcrumbList`);
    assert.equal(types.has("Offer"), false, `${rel} must not emit Offer`);

    for (const forbidden of FORBIDDEN_SCHEMA_KEYS) {
      assert.equal(
        keys.has(forbidden),
        false,
        `${rel} must not include ${forbidden}`,
      );
    }

    const serialized = JSON.stringify(blocks);
    assert.match(serialized, /Not commercially generally available/);
    assert.match(serialized, /not a public always-on phone service/);
    assert.doesNotMatch(serialized, /PreOrder/);
    assert.doesNotMatch(html, /gtag\(|googletagmanager|google-analytics/i);
  }
});

test("exported /faq/ HTML has single claims-safe FAQPage JSON-LD with BreadcrumbList when out/ exists", () => {
  const rel = "out/faq/index.html";
  if (!fs.existsSync(path.join(ROOT, rel))) {
    return;
  }

  const html = read(rel);
  const blocks = parseJsonLdBlocks(html);
  assert.equal(blocks.length, 1, `${rel} should have exactly ONE JSON-LD block`);

  const types = new Set();
  const keys = new Set();
  for (const block of blocks) {
    collectKeys(block, keys);
    const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [block];
    for (const node of graph) {
      if (typeof node["@type"] === "string") types.add(node["@type"]);
    }
  }

  assert.ok(types.has("FAQPage"), `${rel} missing FAQPage`);
  assert.ok(types.has("Organization"), `${rel} missing Organization`);
  assert.ok(types.has("WebSite"), `${rel} missing WebSite`);
  assert.ok(types.has("BreadcrumbList"), `${rel} missing BreadcrumbList`);
  assert.equal(types.has("Offer"), false, `${rel} must not emit Offer`);

  for (const forbidden of FORBIDDEN_SCHEMA_KEYS) {
    assert.equal(
      keys.has(forbidden),
      false,
      `${rel} must not include ${forbidden}`,
    );
  }

  const serialized = JSON.stringify(blocks);

  assert.match(serialized, /browser receptionist preview|browser voice preview|interactive browser receptionist preview/);
  assert.match(serialized, /optional save/);
  assert.match(serialized, /small, bounded set of public HTTPS pages/i);

  assert.match(serialized, /Empty hours and services stay empty/);
  assert.match(serialized, /999 guidance \(never 911\)/);
  assert.match(serialized, /not a live (public )?phone/);
  assert.doesNotMatch(serialized, /always-on phone line is live/i);
  assert.doesNotMatch(html, /gtag\(|googletagmanager|google-analytics/i);
});
