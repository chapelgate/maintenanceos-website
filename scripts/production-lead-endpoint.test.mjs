import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("production lead endpoint does not fall back to the retired Railway host", () => {
  const site = read("src/config/site.ts");
  const form = read("src/components/LeadCaptureForm.tsx");
  const enquiry = read("src/lib/public-enquiry.ts");
  assert.match(
    site,
    /https:\/\/rsfm-control-plane-production\.up\.railway\.app\/v1\/public\/website-leads/,
  );
  assert.match(site, /usableHttpEndpoint\(process\.env\.NEXT_PUBLIC_FORM_ENDPOINT\)/);
  assert.doesNotMatch(site, /NEXT_PUBLIC_FORM_ENDPOINT\?\.trim\(\) \|\|/);
  assert.match(enquiry, /info@chapelgatetechnologies\.com/);
  assert.match(
    enquiry,
    /Online enquiries are temporarily unavailable\. Please email info@chapelgatetechnologies\.com\./,
  );
  assert.match(form, /buildEnquiryMailto/);
  assert.doesNotMatch(form, /<EnquiryUnavailable/);
  assert.match(form, /!siteConfig\.formEndpoint\.trim\(\)/);
  assert.match(form, /Copy details/);
  assert.match(form, /nothing is sent until you press send/i);
  assert.match(
    read("src/components/EnquiryUnavailable.tsx"),
    /mailto:\$\{PUBLIC_ENQUIRY_EMAIL\}/,
  );
  assert.match(
    read("src/components/EnquiryUnavailable.tsx"),
    /ENQUIRY_UNAVAILABLE_MESSAGE/,
  );
});

test("create enquiry address is not in the server HTML that Cloudflare rewrites", () => {
  const enquiry = read("src/components/EnquiryUnavailable.tsx");
  const create = read("src/app/create/page.tsx");
  assert.match(enquiry, /useSyncExternalStore/);
  assert.match(enquiry, /serverSnapshot = \(\) => false/);
  assert.match(enquiry, /addressReady\s*\?\s*ENQUIRY_UNAVAILABLE_MESSAGE/);
  assert.doesNotMatch(create, /andy@chapelgatehome\.uk/);
  assert.doesNotMatch(create, /info@chapelgatetechnologies\.com/);
  assert.match(create, /Please use the email link above/);
});

test("lead adapter sends the current page URL and preserves accepted semantics", () => {
  const adapter = read("src/lib/lead-adapter.ts");
  assert.match(adapter, /source_url:/);
  assert.match(adapter, /window\.location\.href/);
  assert.match(adapter, /mode === "accepted"/);
  assert.doesNotMatch(adapter, /source: "maintenanceos-website"/);
});

test("accepted UI requires and reports provider-accepted visitor confirmation", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.match(form, /accepted into the lead queue/);
  assert.match(form, /confirmation email was accepted by the mail provider/);
  assert.match(form, /result\.confirmationEmail !== "accepted"/);
  assert.match(form, /Reference:/);
  assert.match(form, /Only email is required\. Everything else is optional\./);
});

test("draft privacy notice describes the real lead path without claiming final legal review", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /Railway-hosted control plane returns Application not found/);
  assert.match(privacy, /does not post leads or events there/);
  assert.match(privacy, /info@chapelgatetechnologies\.com/);
  assert.match(privacy, /pending legal review|Pending legal review|DRAFT|Draft/);
});

test("endpoint contract documents durable storage, idempotency and operator notification", () => {
  const contract = read("docs/FORM_ENDPOINT_CONTRACT.md");
  assert.match(contract, /rsfm-control-plane-production\.up\.railway\.app/);
  assert.match(contract, /audited Postgres/);
  assert.match(contract, /Idempotency/);
  assert.match(contract, /sending-only Resend credential/);
  assert.match(contract, /does \*\*not\*\* write into the live telephony/);
});

test("create journey distinguishes production delivery from preview receiver", () => {
  const site = read("src/config/site.ts");
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(site, /export const PRODUCTION_FORM_ENDPOINT/);
  assert.match(later, /siteConfig\.formEndpoint === PRODUCTION_FORM_ENDPOINT/);
  assert.match(later, /Request received/);
  assert.match(later, /confirmation email was accepted by the mail provider/);
  assert.match(later, /confirmation email could not be handed off/);
  assert.match(later, /submissionInFlightRef/);
  assert.match(later, /usesProductionLeadReceiver[\s\S]{0,160}result\.mode === "accepted"/);
  assert.match(later, /result\.confirmationEmail !== "accepted"/);
  assert.match(later, /result\.confirmationEmail !== "failed"/);
  assert.match(later, /receiptReference/);
  assert.match(later, /Test submission completed/);
  assert.match(later, /preview receiver accepted the saved setup/);
  assert.match(later, /preview does not send a confirmation email/);
  assert.match(later, /Saving the setup uses the production lead receiver/);
  assert.doesNotMatch(later, /Submitting does not[\s\S]{0,120}send email/);
  assert.match(later, /data-create-submit-state=\{status\}/);
  assert.match(later, /data-create-submit-state="success"/);
});
