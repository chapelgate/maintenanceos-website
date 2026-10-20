import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const PRODUCT_SHA = "498ad82dd87631814195d447d89458480b117951";
const read = (path) => fs.readFileSync(path, "utf8");

test("signed claims register is pinned to the audited product checkpoint", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  assert.match(claims, new RegExp(PRODUCT_SHA));
  assert.match(claims, /Signed:\*\* 2026-09-30/);
  assert.match(claims, /196 passed \/ 0 failed/);
  assert.match(claims, /CONTROLLED_CARRIER_VOICE: NO-GO/);
  assert.match(claims, /Commercially live \/ GA:\*\* NOT AVAILABLE/);
});

test("voice evidence stays commissioning-only and current live defect remains explicit", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  const inventory = read("docs/competitive/PHONE_AI_FEATURE_INVENTORY.md");
  const config = read("src/config/phone-ai-features.ts");

  assert.match(claims, /\| V-11 \| Pinned local\/self-hosted voice commissioning candidate \|/);
  assert.match(claims, /not final production acceptance/i);
  assert.match(claims, /greet-then-stall/i);
  assert.match(claims, /not deployed/i);
  assert.match(inventory, /M-TEL-05/);
  assert.match(inventory, /not final production acceptance/i);
  assert.doesNotMatch(config, /id: "M-TEL-05"/);
  assert.doesNotMatch(config, /Gemini Live primary/i);
  assert.match(config, /neither path is approved as a public always-on service/i);
});

test("inventory and claims agree on the exact product checkpoint", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  const inventory = read("docs/competitive/PHONE_AI_FEATURE_INVENTORY.md");
  assert.match(claims, new RegExp(PRODUCT_SHA));
  assert.match(inventory, new RegExp(PRODUCT_SHA));
});

test("product refresh is closed in the single backlog and launch checklist", () => {
  const backlog = read("WEBSITE_BACKLOG.md");
  const launch = read("WEBSITE_LAUNCH_CHECKLIST.md");

  assert.match(backlog, /F1-REFRESH[\s\S]*DONE — refreshed 2026-09-30/);
  assert.match(backlog, new RegExp(PRODUCT_SHA));
  assert.match(backlog, /C3-PRODUCT-WIN[\s\S]*NON-BLOCKING ENVIRONMENT LIMIT/);
  assert.match(launch, /\[x\] `PRODUCT_CLAIMS_REGISTER\.md` refreshed on 2026-09-30/);
  assert.match(launch, new RegExp(PRODUCT_SHA));
});

test("production and capacity claims remain forbidden", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  const config = read("src/config/phone-ai-features.ts");

  assert.match(claims, /V-07[\s\S]*NO-GO/);
  assert.match(claims, /V-08[\s\S]*Public production voice/);
  assert.match(claims, /V-09[\s\S]*Concurrent multi-line capacity numbers/);
  assert.match(config, /Live always-on customer phone/);
  assert.match(config, /Concurrent multi-line capacity numbers/);
});


test("retired paid scan service stays retired while bounded website learning returns serverless", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  const inventory = read("docs/competitive/PHONE_AI_FEATURE_INVENTORY.md");
  const site = read("src/config/site.ts");
  const scan = read("packages/onboarding-ingest/packages/website/scan/index.ts");
  const project = read("packages/onboarding-ingest/project.yml");
  const blockers = read("WEBSITE_EXTERNAL_BLOCKERS.md");

  assert.match(claims, /NON-PUBLIC \/ RETIRED FROM THE CURRENT WEBSITE PATH/);
  assert.match(inventory, /M-KNO-01/);
  assert.match(site, /onboardingScanEndpoint:\s*"\/api\/website\/scan"/);
  assert.doesNotMatch(site, /process\.env\.NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(scan, /proxyPersistentScan\(allowed\.url\.toString\(\)/);
  assert.match(scan, /DEFAULT_PERSISTENT_SCANNER_ENDPOINT/);
  assert.doesNotMatch(scan, /runScan\(/);
  assert.match(project, /runtime:\s*nodejs:22/);
  assert.match(blockers, /## CLOSED[\s\S]*WB-002/);
});
