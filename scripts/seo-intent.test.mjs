import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("buyer intent map owns one core purpose per major SEO page", () => {
  const src = read("src/config/seo-intents.ts");
  for (const phrase of [
    "UK maintenance operations software",
    "property maintenance software UK",
    "AI maintenance receptionist",
    "maintenance operations software features",
    "maintenance intake workflow software",
  ]) {
    assert.ok(src.includes(phrase), `missing core intent: ${phrase}`);
  }
  assert.match(src, /property repair management software/);
});

test("all eight industry pages have distinct buyer-intent positioning", () => {
  const src = read("src/config/seo-intents.ts");
  const queries = [
    "property maintenance software for UK landlords",
    "property maintenance software for UK letting agents",    "property maintenance software for UK property managers",
    "maintenance management software for UK maintenance companies",
    "housing maintenance software UK",
    "facilities maintenance software UK",
    "council maintenance software UK",
    "holiday let maintenance software UK",
  ];
  for (const query of queries) assert.ok(src.includes(query), `missing industry query: ${query}`);
  assert.equal(new Set(queries).size, queries.length);
});

test("core property maintenance page is unique, indexable source and internally linked", () => {
  const page = read("src/app/property-maintenance-software/page.tsx");
  const routes = read("src/config/routes.ts");
  const footer = read("src/config/site.ts");
  assert.match(page, /Property maintenance software for UK teams/);
  assert.match(page, /not marketed as a full property-accounting suite/);
  assert.match(page, /funnelPageMetadata\("propertyMaintenanceSoftware"\)/);
  assert.match(page, /fullFunnelPageJsonLd\("propertyMaintenanceSoftware"\)/);
  assert.match(routes, /\/property-maintenance-software\//);
  assert.match(footer, /Property maintenance software/);
});

test("industry pages reuse one component but emit unique metadata and structured data", () => {
  const component = read("src/components/IndustryRolePage.tsx");
  const meta = read("src/lib/page-meta.ts");
  const schema = read("src/lib/json-ld.ts");
  assert.match(component, /getIndustrySeoIntent/);
  assert.match(component, /industryPageJsonLd/);
  assert.match(component, /\/property-maintenance-software\//);  assert.match(meta, /getIndustrySeoIntent/);
  assert.match(schema, /export function industryPageJsonLd/);
  assert.match(schema, /"@type": "BreadcrumbList"/);
  assert.match(schema, /softwareApplicationNode\(\)/);
});

test("SEO monitoring is zero-dependency and checks canonical technical signals", () => {
  const pkg = read("package.json");
  const monitor = read("scripts/seo-live-monitor.mjs");
  assert.match(pkg, /"seo:monitor": "node scripts\/seo-live-monitor\.mjs"/);
  assert.match(monitor, /seo_check=/);
  assert.match(monitor, /cache-control/);
  assert.match(monitor, /canonical mismatch/);
  assert.match(monitor, /duplicate title/);
  assert.match(monitor, /duplicate description/);
  assert.match(monitor, /missing from sitemap/);
  assert.match(monitor, /noindex present/);
});

test("exported industry pages contain page schema when out exists", () => {
  const slugs = [
    "landlords", "letting-agents", "property-managers", "maintenance-companies",
    "housing-associations", "facilities-management", "councils", "holiday-lets",
  ];
  for (const slug of slugs) {
    const rel = `out/industries/${slug}/index.html`;
    if (!fs.existsSync(path.join(ROOT, rel))) continue;
    const html = read(rel);
    assert.match(html, /BreadcrumbList/);
    assert.match(html, /SoftwareApplication/);
    assert.match(html, /WebPage/);
    assert.doesNotMatch(html, /aggregateRating/);
  }
});
