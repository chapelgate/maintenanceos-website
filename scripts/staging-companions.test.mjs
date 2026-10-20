import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("staging companions checklist links the four runbooks and exact DO env", () => {
  const doc = read("docs/STAGING_COMPANIONS.md");
  assert.match(doc, /ONBOARDING_SCAN_DEPLOY\.md/);
  assert.match(doc, /SANDBOX_DEPLOY\.md/);
  assert.match(doc, /DASHBOARD_DEPLOY\.md/);
  assert.match(doc, /FONIO_LOCAL_E2E\.md/);
  assert.match(doc, /seahorse-app-4oasq\.ondigitalocean\.app/);
  assert.match(doc, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(doc, /NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED/);
  assert.match(doc, /NEXT_PUBLIC_CALENDAR_ENDPOINT/);
  assert.match(doc, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED/);
  assert.match(doc, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT/);
  assert.match(doc, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED/);
  assert.match(doc, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT/);
  assert.match(doc, /Force Rebuild/);
  assert.match(doc, /src\/config\/site\.ts/);
  assert.match(doc, /maintenanceos-onboarding-scan/);
  assert.match(doc, /maintenanceos-sandbox-test-call/);
  assert.match(doc, /maintenanceos-calendar-adapters/);
  assert.match(doc, /maintenanceos-customer-dashboard/);
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /DigitalOcean droplet/);
  assert.match(doc, /do not use Render/i);
  assert.match(doc, /maintenanceos-redteam/);
  assert.match(doc, /does \*\*not\*\* create DigitalOcean or Render resources/);
  assert.match(doc, /copy `\.env\.example\.fonio-local` onto App Platform/);
  assert.match(doc, /Health-check order/);
  assert.match(doc, /review hint/);
  assert.match(doc, /Optional staging enablement \(not a current code blocker\)/);
  assert.match(doc, /not a website code defect/);
  assert.match(doc, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(doc, /NEXT_PUBLIC_\*/);
});

test("fonio website readiness separates DigitalOcean enablement from code blockers", () => {
  const doc = read("docs/FONIO_WEBSITE_READINESS.md");
  assert.match(doc, /DigitalOcean droplet/);
  assert.match(doc, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /do not use Render/i);
  assert.ok(doc.includes("Launch / enablement dependencies"));
  assert.match(doc, /not a website code defect/);
  assert.match(doc, /seahorse-app-4oasq\.ondigitalocean\.app/);
  assert.match(doc, /ONBOARDING_SCAN_DEPLOY\.md/);
  assert.match(doc, /STAGING_COMPANIONS\.md/);
});

test("site.ts public env names match the staging companions checklist", () => {
  const site = read("src/config/site.ts");
  assert.match(site, /onboardingScanEndpoint:\s*"\/api\/website\/scan"/);
  assert.doesNotMatch(site, /process\.env\.NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_CALENDAR_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT/);
});

test("create draft review surfaces fieldMeta as per-field hints", () => {
  const form = [
    read("src/components/CreateReceptionistForm.tsx"),
    read("src/components/CreateReceptionistLaterSteps.tsx"),
  ].join("\n");
  assert.match(form, /scanFieldReviewHint/);
  assert.match(form, /DraftReviewField/);
  assert.match(form, /ReceptionistDraftPreview/);
  assert.doesNotMatch(form, /Scan provenance \(untrusted page text\)/);
});

test("next.config static export is unchanged by the staging companions checklist", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});

test("render.yaml is legacy and still points at the staging companions checklist", () => {
  const yaml = read("render.yaml");
  assert.match(yaml, /LEGACY \/ DO NOT USE/);
  assert.match(yaml, /docs\/STAGING_COMPANIONS\.md/);
  assert.match(yaml, /docs\/FONIO_WEBSITE_READINESS\.md/);
});
