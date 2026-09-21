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
  assert.match(src, /from ["']@\/lib\/page-meta["']/);
  assert.match(src, /funnelPageCopy/);
  assert.match(src, /"@type": "Organization"/);
  assert.match(src, /"@type": "WebSite"/);
  assert.match(src, /"@type": "WebPage"/);
  assert.match(src, /"@type": "SoftwareApplication"/);
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

test("layout keeps site-wide Organization + WebSite only", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /marketingJsonLd\(\)/);
  assert.match(layout, /contentSecurityPolicy/);
  assert.doesNotMatch(layout, /funnelPageJsonLd/);
});

test("home and key funnel pages emit funnelPageJsonLd", () => {
  for (const [file, key] of Object.entries(FUNNEL_PAGES)) {
    const src = read(file);
    assert.match(
      src,
      new RegExp(`funnelPageJsonLd\\("${key}"\\)`),
      `${file} should render funnelPageJsonLd("${key}")`,
    );
    assert.match(src, /from ["']@\/components\/JsonLd["']/);
  }
});

test("FAQ JSON-LD stays on /faq/ and uses the shared funnel answers", () => {
  const faqPage = read("src/app/faq/page.tsx");
  const helper = read("src/lib/json-ld.ts");
  const faqs = read("src/content/faqs.ts");
  assert.match(faqPage, /faqPageJsonLd\(\)/);
  assert.match(helper, /export function faqPageJsonLd/);
  assert.match(helper, /"@type": "FAQPage"/);
  assert.match(helper, /from ["']@\/content\/faqs["']/);
  assert.match(helper, /faqItems\.map/);
  assert.doesNotMatch(helper, /aggregateRating/);
  assert.match(
    faqs,
    /website URL → check → review → pack → optional scripted sandbox → early access/,
  );
  assert.match(faqs, /owner-blocked/);
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

test("exported funnel HTML has claims-safe JSON-LD when out/ exists", () => {
  const files = {
    "out/index.html": "home",
    "out/create/index.html": "create",
    "out/demo/index.html": "demo",
    "out/how-it-works/index.html": "howItWorks",
    "out/features/index.html": "features",
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
    assert.ok(blocks.length >= 2, `${rel} should have layout + page JSON-LD`);

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

test("exported /faq/ HTML has claims-safe FAQPage JSON-LD when out/ exists", () => {
  const rel = "out/faq/index.html";
  if (!fs.existsSync(path.join(ROOT, rel))) {
    return;
  }

  const html = read(rel);
  const blocks = parseJsonLdBlocks(html);
  assert.ok(blocks.length >= 2, `${rel} should have layout + FAQ JSON-LD`);

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
  assert.equal(types.has("Offer"), false, `${rel} must not emit Offer`);

  for (const forbidden of FORBIDDEN_SCHEMA_KEYS) {
    assert.equal(
      keys.has(forbidden),
      false,
      `${rel} must not include ${forbidden}`,
    );
  }

  const serialized = JSON.stringify(blocks);
  assert.match(
    serialized,
    /website URL → check → review → pack → optional scripted sandbox → early access/,
  );
  assert.match(serialized, /owner-blocked/);
  assert.match(serialized, /Empty hours and services stay empty/);
  assert.match(serialized, /999 guidance \(never 911\)/);
  assert.match(serialized, /not a live phone/);
  assert.doesNotMatch(serialized, /always-on phone line is live/i);
  assert.doesNotMatch(html, /gtag\(|googletagmanager|google-analytics/i);
});
