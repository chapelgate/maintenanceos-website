import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("measurement is first-party and has no analytics dependency", () => {
  const pkg = read("package.json");
  const config = read("src/config/site.ts");
  assert.match(config, /v1\/public\/website-events/);
  assert.doesNotMatch(
    pkg,
    /google-analytics|gtag|plausible|fathom|posthog|mixpanel|segment|amplitude/i,
  );
});

test("client event contract is bounded and excludes persistent visitor identity", () => {
  const src = read("src/lib/measurement.ts");
  assert.match(src, /window\.location\.pathname/);
  assert.doesNotMatch(src, /window\.location\.href/);
  assert.doesNotMatch(
    src,
    /document\.cookie|window\.localStorage|window\.sessionStorage|globalThis\.localStorage/,
  );
  assert.doesNotMatch(src, /navigator\.userAgent|document\.referrer/);
  for (const event of [
    "page_view",
    "cta_click",
    "form_submit_start",
    "form_submit_success",
    "form_submit_error",
    "client_error",
  ]) {
    assert.ok(src.includes(event), "missing event " + event);
  }
  assert.match(src, /credentials: "omit"/);
  assert.match(src, /referrerPolicy: "no-referrer"/);
  assert.match(src, /cache: "no-store"/);
  assert.match(src, /event_id/);
});

test("root measurement tracks page views conversions and only generic client errors", () => {
  const component = read("src/components/WebsiteMeasurement.tsx");
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /<WebsiteMeasurement \/>/);
  assert.equal(
    (layout.match(/import \{ WebsiteMeasurement \}/g) || []).length,
    1,
  );
  assert.match(component, /CONVERSION_PATHS/);
  assert.match(component, /\/create\//);
  assert.match(component, /\/demo\//);
  assert.match(component, /\/contact\//);
  assert.match(component, /\/pricing\//);
  assert.match(component, /clientErrorSent/);
  assert.match(component, /window\.addEventListener\("error"/);
  assert.match(component, /window\.addEventListener\("unhandledrejection"/);
  assert.doesNotMatch(component, /\.message|\.stack|\.reason/);
});

test("lead form lifecycle emits bounded start success and error events", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.match(form, /from "@\/lib\/measurement"/);
  assert.match(form, /form_submit_start/);
  assert.match(form, /form_submit_success/);
  assert.match(form, /form_submit_error/);
  assert.match(form, /leadType/);
  assert.match(form, /if \(!website\)/);
});

test("health monitor checks sitemap links assets backend and event CORS", () => {
  const monitor = read("scripts/website-health-monitor.mjs");
  assert.match(monitor, /sitemap\.xml/);
  assert.match(monitor, /const internalPaths = new Set/);
  assert.match(monitor, /assetUrls/);
  assert.match(monitor, /pagesAndAssetsChecked/);
  assert.match(monitor, /control plane backend is not ready on durable Postgres/);
  assert.match(monitor, /v1\/public\/website-events/);
  assert.match(monitor, /Access-Control-Request-Method/);
  assert.doesNotMatch(monitor, /rsfm-control-plane/);
  assert.match(
    read("package.json"),
    /"website:monitor": "node scripts\/website-health-monitor\.mjs"/,
  );
});

test("health monitor does not default to the retired railway host", () => {
  const monitor = read("scripts/website-health-monitor.mjs");
  assert.doesNotMatch(monitor, /rsfm-control-plane/);
});

test("health monitor checks a control plane only when WEBSITE_CONTROL_PLANE is set", () => {
  const monitor = read("scripts/website-health-monitor.mjs");
  const guardStart = monitor.indexOf("if (controlPlane) {");
  assert.ok(guardStart !== -1, "control plane guard missing");
  const guarded = monitor.slice(guardStart);
  assert.match(guarded, /control plane backend is not ready on durable Postgres/);
  assert.match(guarded, /v1\/public\/website-events/);
});

test("KPI document forbids unique-user tracking and describes event-triggered weekly report", () => {
  const doc = read("docs/STEP9_MEASUREMENT.md");
  assert.match(doc, /No unique-user\/visitor KPI/);
  assert.match(doc, /website\.report\.weekly/);
  assert.match(doc, /first accepted anonymous event in a new week/);
  assert.match(doc, /does not include visitor identifiers or lead contact details/);
  assert.match(doc, /no visitor identifier/i);
});
