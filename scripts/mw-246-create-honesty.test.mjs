import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("create page has funnel page metadata", () => {
  const page = read("src/app/create/page.tsx");
  assert.ok(page.includes("funnelPageMetadata"));
  assert.ok(page.includes('funnelPageMetadata("create")'));
  assert.ok(page.includes("fullFunnelPageJsonLd"));
});

test("create page has PageHero with honest lede", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /Repair intake/);
  assert.match(page, /Paste your site URL/);
  assert.match(page, /Online enquiries are temporarily unavailable/);
  assert.match(page, /preview is not stored/);
  assert.match(page, /does not change your live telephone service, book viewings, or write into a CRM/);
});

test("create page has demo phone number section with honest labeling", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /Preview demo number/);
  assert.match(page, /not production/);
  assert.match(page, /Not a production answering service/);
  assert.match(page, /not a live always-on phone/);
});

test("create page has funnel path strip", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /FunnelPathStrip/);
  assert.match(page, /linked/);
});

test("create page has enquiry unavailable", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /EnquiryUnavailable/);
});

test("create page has create journey section", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /CreateJourneySection/);
});

test("create page has create ingest privacy note", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /CreateIngestPrivacyNote/);
});

test("create page has calendar connect section", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /CalendarConnectSection/);
});

test("create page has honest steps with no invention claims", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /Missing details stay empty rather than being invented/);
  assert.match(page, /missing fields are not invented/);
  assert.match(page, /missing information stays missing/);
  assert.match(page, /The preview stays[\s\S]*in this browser/);
});

test("create page has honest limits section", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /Website learning is read-only/);
  assert.match(page, /read-only, limited to a small set/);
  assert.match(page, /HTTPS pages, honours robots.txt/);
  assert.match(page, /blocks private or internal/);
  assert.match(page, /network targets/);
  assert.match(page, /Extracted facts are shown for review/);
  assert.match(page, /If opening hours, services/);
  assert.match(page, /stay missing rather/);
  assert.match(page, /does not assign or dial a public telephone number/);
  assert.match(page, /live telephone service remains isolated/);
});