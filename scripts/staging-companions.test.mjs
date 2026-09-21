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
  assert.match(doc, /15 minutes/);
  assert.match(doc, /maintenanceos-redteam/);
  assert.match(doc, /does \*\*not\*\* create Render or DigitalOcean resources/);
  assert.match(doc, /copy `\.env\.example\.fonio-local` onto App Platform/);
  assert.match(doc, /Cold-start wake order/);
  assert.match(doc, /review hint/);
  assert.match(doc, /Owner blocker \(not a code defect\)/);
  assert.match(doc, /not a website code defect/);
  assert.match(doc, /Render free/);
  assert.match(doc, /NEXT_PUBLIC_\*/);
});

test("site.ts public env names match the staging companions checklist", () => {
  const site = read("src/config/site.ts");
  assert.match(site, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_CALENDAR_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT/);
});

test("create draft review surfaces fieldMeta as per-field hints", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /scanFieldReviewHint/);
  assert.match(form, /DraftReviewField/);
  assert.match(form, /ReceptionistDraftPreview/);
  assert.doesNotMatch(form, /Scan provenance \(untrusted page text\)/);
});

test("next.config static export is unchanged by the staging companions checklist", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});

test("render.yaml points operators at the staging companions checklist", () => {
  const yaml = read("render.yaml");
  assert.match(yaml, /docs\/STAGING_COMPANIONS\.md/);
  assert.equal((yaml.match(/^\s+plan:\s*free$/gm) || []).length, 4);
});
