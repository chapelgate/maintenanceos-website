import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("backlog has one truthful set of continuation and launch gates", () => {
  const backlog = read("WEBSITE_BACKLOG.md");
  assert.match(backlog, /F1-REFRESH/);
  assert.match(backlog, /F13-LEGAL/);
  assert.match(backlog, /F15-MANUAL/);
  assert.match(backlog, /F17-HEADERS/);
  assert.match(backlog, /F21[\s\S]*PARTIAL/);
  assert.match(backlog, /F22[\s\S]*OPEN LAUNCH QA/);
  assert.match(backlog, /single persistent website problem register/i);
});

test("launch checklist separates completed engineering from human launch gates", () => {
  const checklist = read("WEBSITE_LAUNCH_CHECKLIST.md");
  assert.match(checklist, /PRE-LAUNCH/);
  assert.match(checklist, /Do \*\*not\*\* set .*PUBLIC_LAUNCH=true/);
  assert.match(checklist, /\[ \] Counsel final review/);
  assert.match(checklist, /\[ \] Full manual keyboard/);
  assert.match(checklist, /\[ \] Staging red-team report/);
  assert.match(checklist, /\[ \] Owner approval/);
});

test("security review records the real static-host gap without theatre", () => {
  const review = read("WEBSITE_SECURITY_REVIEW.md");
  assert.match(review, /0 known vulnerabilities/);
  assert.match(review, /clickjacking/);
  assert.match(review, /X-Frame-Options/);
  assert.match(review, /do not add fake meta tags/i);
});

test("handoff points to the single backlog and closed-loop release path", () => {
  const handoff = read("CURSOR_HANDOFF.md");
  assert.match(handoff, /WEBSITE_BACKLOG\.md/);
  assert.match(handoff, /single persistent problem register/i);
  assert.match(handoff, /manager:monitor/);
  assert.match(handoff, /manager:preflight/);
  assert.match(handoff, /manager:verify/);
  assert.match(handoff, /manager:record/);
});

test("companion deployment docs cannot regress to Render instructions", () => {
  const docs = [
    read(".env.example"),
    read("docs/SANDBOX_DEPLOY.md"),
    read("docs/DASHBOARD_DEPLOY.md"),
  ].join("\n");
  assert.match(docs, /DigitalOcean/);
  assert.match(docs, /not Render|do not use Render/i);
  assert.doesNotMatch(docs, /onrender\.com|Render Dashboard|Render free web service/i);
});

test("architecture no longer reports the live lead path as undecided", () => {
  const architecture = read("WEBSITE_ARCHITECTURE.md");
  assert.match(architecture, /Lead-capture provider \| \*\*CLOSED\*\*/);
  assert.doesNotMatch(architecture, /production endpoint still separate/);
});
