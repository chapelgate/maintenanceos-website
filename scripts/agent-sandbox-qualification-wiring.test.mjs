import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

test("Step 7 qualification is companion-only and has no network or telephony path", () => {
  const policy = read("src/lib/agent-sandbox-qualification.ts");
  assert.match(policy, /id: "companion_boundary"/);
  assert.match(policy, /input\.source === "companion"/);
  assert.match(policy, /lifecycle: \{ stage: "sandbox_passed" \}/);
  assert.match(policy, /scripted_transcript_exact/);
  assert.doesNotMatch(policy, /fetch\s*\(/);
  assert.doesNotMatch(policy, /twilio|carrier|phone number provisioning/i);
});

test("Step 7 invalidates qualification when the review revision changes", () => {
  const journey = read("src/components/CreateJourney.tsx");
  assert.match(journey, /setSandboxQualification\(null\)/);
  assert.match(
    journey,
    /key=\{reviewSubject\?\.reviewRecord\.revisionId \?\? "preview-unreviewed"\}/,
  );
  assert.match(journey, /onReviewSubjectChange=\{onReviewSubjectChange\}/);
  assert.match(journey, /sandboxQualification=\{sandboxQualification\}/);
});

test("Step 7 exposes only a complete current review to sandbox qualification", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(later, /if \(!reviewRecord\.complete\) \{/);
  assert.match(later, /onReviewSubjectChange\(null\)/);
  assert.match(later, /reviewRecord,/);
  assert.match(later, /missing: receptionist\.knowledgePack\.missing/);
});

test("Step 7 blocks enabled-flow submit until current qualification matches", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(
    later,
    /const qualificationRequired =[\s\S]*siteConfig\.sandboxTestCallEnabled[\s\S]*siteConfig\.sandboxTestCallEndpoint\.trim/,
  );
  assert.match(later, /qualificationMatchesReview\(/);
  assert.match(later, /Run configuration verification for this exact reviewed configuration before saving/);
  assert.match(later, /sandboxQualification: qualificationRequired/);
  assert.match(later, /agentBlueprint: submissionBlueprint/);
});

test("public browser demo remains demo-only and cannot unlock qualification", () => {
  const panel = read("src/components/SandboxTestCallPanel.tsx");
  assert.match(panel, /runBrowserInteractiveReply/);
  assert.match(
    panel,
    /siteConfig\.sandboxTestCallEnabled && Boolean\(endpoint\) && Boolean\(reviewSubject\)/,
  );
  assert.match(panel, /requestSandboxScriptedDemo/);
  assert.match(panel, /source: "companion"/);
  assert.match(panel, /onQualificationChange\?\.\(qualification\)/);
});

test("Step 7 leaves sandbox feature off by default", () => {
  const config = read("src/config/site.ts");
  assert.match(
    config,
    /sandboxTestCallEnabled: envFlag\([\s\S]*NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED,[\s\S]*false/,
  );
});
