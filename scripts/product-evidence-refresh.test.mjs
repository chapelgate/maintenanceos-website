import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const PRODUCT_SHA = "cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8";
const read = (path) => fs.readFileSync(path, "utf8");

test("signed claims register is pinned to the audited product checkpoint", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  assert.match(claims, new RegExp(PRODUCT_SHA));
  assert.match(claims, /Signed:\*\* 2026-09-26/);
  assert.match(claims, /88 passed \/ 0 failed/);
  assert.match(claims, /CONTROLLED_CARRIER_VOICE: NO-GO/);
  assert.match(claims, /Commercially live \/ GA:\*\* NOT AVAILABLE/);
});

test("new sovereign voice evidence stays commissioning-only", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  const inventory = read("docs/competitive/PHONE_AI_FEATURE_INVENTORY.md");
  const config = read("src/config/phone-ai-features.ts");

  assert.match(claims, /\| V-11 \| Pinned local\/self-hosted voice commissioning candidate \|/);
  assert.match(claims, /not final production acceptance/i);
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

  assert.match(backlog, /F1-REFRESH[\s\S]*DONE — Continuation Step 3/);
  assert.match(backlog, new RegExp(PRODUCT_SHA));
  assert.match(backlog, /C3-PRODUCT-WIN[\s\S]*NON-BLOCKING ENVIRONMENT LIMIT/);
  assert.match(launch, /\[x\] `PRODUCT_CLAIMS_REGISTER\.md` refreshed on 2026-09-26/);
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
