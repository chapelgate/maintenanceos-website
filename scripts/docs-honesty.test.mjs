import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("README references security baseline and launch checklist", () => {
  const readme = read("README.md");
  assert.match(readme, /docs\/security\/static-security-baseline\.md/);
  assert.match(readme, /WEBSITE_LAUNCH_CHECKLIST\.md/);
  // WEBSITE_EXTERNAL_BLOCKERS.md is referenced elsewhere, not directly in README
});

test("launch checklist keeps human gates open", () => {
  const checklist = read("WEBSITE_LAUNCH_CHECKLIST.md");
  assert.match(checklist, /- \[ \] Owner approval to set `NEXT_PUBLIC_PUBLIC_LAUNCH=true`/);
  assert.match(checklist, /- \[ \] Legal drafts cleared by counsel/);
  assert.match(checklist, /- \[ \] Security response-header risk resolved\/accepted/);
  assert.match(checklist, /- \[ \] Manual accessibility \+ cross-browser QA complete/);
});

test("external blockers doc does not list human gates as engineering blockers", () => {
  const blockers = read("WEBSITE_EXTERNAL_BLOCKERS.md");
  assert.match(blockers, /No external blocker currently prevents ordinary website engineering/);
  assert.doesNotMatch(blockers, /^### .*counsel/im);
  assert.doesNotMatch(blockers, /^### .*accessibility/im);
  assert.doesNotMatch(blockers, /^### .*owner public-launch/im);
});

test("decisions log records andy mailbox decision not engineer-invented", () => {
  const decisions = read("DECISIONS.md");
  assert.match(decisions, /andy@chapelgatehome\.uk/);
  assert.match(decisions, /lead notification destination/);
});

test("product claims register is signed", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  assert.match(claims, /Signed:/);
  assert.match(claims, /under testing/);
});