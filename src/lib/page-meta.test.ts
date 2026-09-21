import assert from "node:assert/strict";
import test from "node:test";
import {
  FUNNEL_PATH_LABEL,
  buildRootMetadata,
  contentPageMetadata,
  funnelPageCopy,
  funnelPageMetadata,
} from "./page-meta.ts";

const FUNNEL_PAGES = [
  "home",
  "create",
  "demo",
  "howItWorks",
  "features",
] as const;

function metaText(meta: ReturnType<typeof funnelPageMetadata>): string {
  const title =
    typeof meta.title === "string"
      ? meta.title
      : meta.title && typeof meta.title === "object" && "absolute" in meta.title
        ? String(meta.title.absolute)
        : "";
  return [
    title,
    meta.description,
    meta.openGraph?.title,
    meta.openGraph?.description,
    meta.twitter?.title,
    meta.twitter?.description,
  ]
    .map((value) => String(value ?? ""))
    .join("\n");
}

test("funnel path label names the real public steps", () => {
  assert.match(FUNNEL_PATH_LABEL, /Website/);
  assert.match(FUNNEL_PATH_LABEL, /Check/);
  assert.match(FUNNEL_PATH_LABEL, /Review/);
  assert.match(FUNNEL_PATH_LABEL, /Pack/);
  assert.match(FUNNEL_PATH_LABEL, /optional sandbox/);
  assert.match(FUNNEL_PATH_LABEL, /early access/);
});

test("funnel page metadata matches the path and stays claims-safe", () => {
  for (const page of FUNNEL_PAGES) {
    const copy = funnelPageCopy[page];
    const meta = funnelPageMetadata(page);
    const blob = metaText(meta);

    assert.equal(meta.description, copy.description);
    assert.equal(meta.openGraph?.description, copy.description);
    assert.equal(meta.twitter?.description, copy.description);
    assert.match(blob, /Website → Check → Review → Pack → optional sandbox → early access/);
    assert.match(blob, /pre-launch/i);
    assert.match(blob, /not a live phone/i);
    assert.doesNotMatch(blob, /Create your AI receptionist/i);
    assert.doesNotMatch(blob, /24\/7/);
    assert.doesNotMatch(blob, /30-second/);
    assert.doesNotMatch(blob, /commercially generally available/i);
    assert.doesNotMatch(blob, /always-on (customer )?phone service/i);
    assert.doesNotMatch(blob, /Property maintenance operations for UK landlords/);
  }
});

test("home uses an absolute title so OG and Twitter stay aligned", () => {
  const meta = funnelPageMetadata("home");
  const absolute = funnelPageCopy.home.absoluteTitle;
  assert.deepEqual(meta.title, { absolute });
  assert.equal(meta.openGraph?.title, absolute);
  assert.equal(meta.twitter?.title, absolute);
  assert.match(absolute, /MaintenanceOS/);
  assert.match(absolute, /Website to knowledge pack/);
});

test("inner funnel pages use the site title template for OG", () => {
  for (const page of ["create", "demo", "howItWorks", "features"] as const) {
    const meta = funnelPageMetadata(page);
    const expected = `${funnelPageCopy[page].title} · MaintenanceOS`;
    assert.equal(meta.title, funnelPageCopy[page].title);
    assert.equal(meta.openGraph?.title, expected);
    assert.equal(meta.twitter?.title, expected);
  }
});

test("contentPageMetadata keeps title, description, and OG in lockstep", () => {
  const meta = contentPageMetadata({
    title: "Create from your website",
    description: funnelPageCopy.create.description,
    path: "/create/",
  });
  assert.equal(meta.title, "Create from your website");
  assert.equal(meta.openGraph?.title, "Create from your website · MaintenanceOS");
  assert.equal(meta.openGraph?.description, funnelPageCopy.create.description);
  assert.equal(meta.twitter?.title, "Create from your website · MaintenanceOS");
  assert.match(String(meta.alternates?.canonical), /\/create\/$/);
});

test("root fallback title no longer lags as generic operations copy", () => {
  const root = buildRootMetadata();
  const title =
    root.title && typeof root.title === "object" && "default" in root.title
      ? String(root.title.default)
      : "";
  assert.match(title, /Website to knowledge pack/);
  assert.doesNotMatch(title, /Property maintenance operations$/);
});
