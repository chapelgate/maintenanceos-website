import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (p) => fs.readFileSync(p, "utf8");

test("public launch defaults false in code and example configuration", () => {
  const site = read("src/config/site.ts");
  const env = read(".env.example");
  assert.match(site, /publicLaunch:\s*envFlag\(process\.env\.NEXT_PUBLIC_PUBLIC_LAUNCH, false\)/);
  assert.match(env, /NEXT_PUBLIC_PUBLIC_LAUNCH=false/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_PUBLIC_LAUNCH=true/);
});

test("legal surfaces stay visibly draft and preserve counsel placeholders", () => {
  const banner = read("src/components/LegalDraftBanner.tsx");
  const privacy = read("src/app/privacy/page.tsx");
  const cookies = read("src/app/cookies/page.tsx");
  const terms = read("src/app/terms/page.tsx");
  assert.match(banner, /DRAFT FOR LEGAL REVIEW/);
  for (const source of [privacy, cookies, terms]) {
    assert.match(source, /LegalDraftBanner/);
    assert.match(source, /Draft|DRAFT|pending legal review|Pending legal review/);
  }
  assert.match(privacy, /\[ANDY:/);
  assert.match(terms, /\[ANDY:/);
});

test("launch checklist keeps human gates open instead of inventing completion", () => {
  const checklist = read("WEBSITE_LAUNCH_CHECKLIST.md");
  for (const expected of [
    /- \[ \] Owner approval to set `NEXT_PUBLIC_PUBLIC_LAUNCH=true`/,
    /- \[ \] Legal drafts cleared by counsel/,
    /- \[ \] Security response-header risk resolved\/accepted/,
    /- \[ \] Manual accessibility \+ cross-browser QA complete/,
  ]) {
    assert.match(checklist, expected);
  }
  assert.match(checklist, /- \[x\] Bounded staging red-team report reviewed/);
});

test("human launch gates are not mislabeled as engineering blockers", () => {
  const blockers = read("WEBSITE_EXTERNAL_BLOCKERS.md");
  assert.match(blockers, /## OPEN[\s\S]*No external blocker currently prevents ordinary website engineering/);
  assert.match(blockers, /## CLOSED[\s\S]*WB-002 — App Platform component-only onboarding-scan retirement/);
  assert.doesNotMatch(blockers, /^### .*counsel/im);
  assert.doesNotMatch(blockers, /^### .*accessibility/im);
  assert.doesNotMatch(blockers, /^### .*owner public-launch/im);
});
