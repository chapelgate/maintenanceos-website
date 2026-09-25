import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("production lead endpoint reuses the existing Railway control plane", () => {
  const site = read("src/config/site.ts");
  assert.match(
    site,
    /https:\/\/rsfm-control-plane-production\.up\.railway\.app\/v1\/public\/website-leads/,
  );
  assert.match(site, /NEXT_PUBLIC_FORM_ENDPOINT\?\.trim\(\) \|\|/);
});

test("lead adapter sends the current page URL and preserves accepted semantics", () => {
  const adapter = read("src/lib/lead-adapter.ts");
  assert.match(adapter, /source_url:/);
  assert.match(adapter, /window\.location\.href/);
  assert.match(adapter, /mode === "accepted"/);
  assert.doesNotMatch(adapter, /source: "maintenanceos-website"/);
});

test("accepted UI remains truthful about visitor email", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.match(form, /accepted into the lead queue/);
  assert.match(form, /No confirmation email was sent/);
  assert.match(form, /Only email is required\. Everything else is optional\./);
});

test("draft privacy notice describes the real lead path without claiming final legal review", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /Railway-hosted control plane/);
  assert.match(privacy, /audited operational lead records/);
  assert.match(privacy, /Resend for human follow-up|Resend for operator notification/);
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
