import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function readCreateFormGraph() {
  return [
    read("src/components/CreateReceptionistForm.tsx"),
    read("src/components/CreateReceptionistLaterSteps.tsx"),
    read("src/components/CreateJourneyStepper.tsx"),
  ].join("\n");
}

test("/create stepper exposes current step beyond colour", () => {
  const form = readCreateFormGraph();
  assert.match(form, /aria-label="Create AI agent steps"/);
  assert.match(form, /aria-current=\{current \? "step" : undefined\}/);
  assert.match(form, /createJourneyStepStatusLabel/);
  assert.match(form, /createJourneyStepAnnouncement/);
  assert.match(form, /stepHeadingRef\.current\?\.focus\(\)/);
  assert.match(form, /tabIndex=\{-1\}/);
  assert.doesNotMatch(form, /live (phone|number) was assigned/i);
});

test("/create agent selector is a bounded native radio group", () => {
  const selector = read("src/components/AgentTypeSelector.tsx");
  const templates = read("src/lib/agent-selection.ts");
  assert.match(selector, /<fieldset>/);
  assert.match(selector, /What do you want your AI to do\?/);
  assert.match(selector, /type="radio"/);
  assert.match(selector, /name="agent-type"/);
  assert.match(selector, /AGENT_TEMPLATES\.map/);
  assert.match(templates, /type: "receptionist"/);
  assert.match(templates, /type: "maintenance_desk"/);
  assert.match(templates, /type: "booking_assistant"/);
  assert.match(templates, /type: "customer_service"/);
  assert.match(templates, /type: "sales_enquiry"/);
  assert.match(templates, /type: "custom"/);
});

test("/create final review is explicit and fail-closed", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  const gate = read("src/components/AgentReviewGate.tsx");
  const review = read("src/lib/agent-review.ts");

  assert.match(gate, /Final customer review/);
  assert.match(gate, /<fieldset/);
  assert.match(gate, /Required confirmations/);
  assert.match(gate, /type="checkbox"/);
  const preview = read("src/components/ReceptionistDraftPreview.tsx");
  assert.match(preview, /Final normalized knowledge pack \(read-only\)/);
  assert.match(preview, /data-final-knowledge-pack="readonly"/);
  assert.match(preview, /JSON\.stringify\(result\.knowledgePack, null, 2\)/);
  assert.match(preview, /Final stored system prompt \(read-only\)/);
  assert.match(preview, /data-final-system-prompt="readonly"/);
  assert.match(preview, /\{result\.systemPrompt\}/);
  assert.match(later, /buildAgentReviewRecord/);
  assert.match(
    later,
    /Complete every required review confirmation before submitting this configuration\./,
  );
  assert.match(
    later,
    /Fix the knowledge pack JSON before submitting this configuration\./,
  );
  assert.match(later, /disabled=\{status === "submitting"\}/);
  assert.match(
    later,
    /scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/,
  );
  assert.match(review, /fact:businessName/);
  assert.match(review, /fact:website/);
  assert.match(review, /low_confidence/);
  assert.match(review, /consequential/);
});

test("/create fields keep visible labels and tie errors with aria-describedby", () => {
  const form = readCreateFormGraph();
  const preview = read("src/components/ReceptionistDraftPreview.tsx");
  assert.match(form, /Business website URL \(required\)/);
  assert.match(form, /Email \(required\)/);
  assert.match(form, /errorField === "businessUrl"/);
  assert.match(form, /errorField === "email"/);
  assert.match(form, /aria-describedby=\{/);
  assert.match(form, /aria-invalid=\{errorField === "businessUrl"/);
  assert.match(preview, /Knowledge pack \(editable JSON\)/);
  assert.match(preview, /aria-describedby=\{packError \? packErrorId : undefined\}/);
});

test("/create primary next actions stay in DOM order and are marked", () => {
  const form = readCreateFormGraph();
  const globals = read("src/app/globals.css");
  assert.equal((form.match(/data-create-primary-action=""/g) || []).length, 5);
  assert.match(globals, /button:focus-visible/);
  assert.match(globals, /outline: 2px solid var\(--color-accent\)/);
});

test("empty hours and services stay textual for AT", () => {
  const form = readCreateFormGraph();
  const lib = read("src/lib/onboarding-create.ts");
  assert.match(form, /Empty — not on file/);
  assert.match(form, /emptyHoursOrServicesNote\("hours"/);
  assert.match(form, /emptyHoursOrServicesNote\("services"/);
  assert.match(form, /data-empty-field=\{empty \|\| undefined\}/);
  assert.match(lib, /Empty — not on file\. Opening hours were not invented/);
  assert.match(lib, /Empty — not on file\. Services were not invented/);
  assert.doesNotMatch(lib, /Mon–Fri 09:00/);
});

test("interactive receptionist and limitations regions have labelled headings", () => {
  const page = read("src/app/create/page.tsx");
  const demo = read("src/components/SandboxTestCallPanel.tsx");
  const preview = read("src/components/ReceptionistDraftPreview.tsx");
  const islands = read("src/components/create-funnel-islands.tsx");
  const enabledIslands = read("src/components/create-funnel-islands.enabled.tsx");

  assert.match(page, /aria-labelledby="create-limits-heading"/);
  assert.match(page, /id="create-limits-heading"/);
  assert.match(page, /CreateIngestPrivacyNote/);
  const privacyNote = read("src/components/CreateIngestPrivacyNote.tsx");
  assert.match(privacyNote, /aria-labelledby="create-privacy-heading"/);
  assert.match(privacyNote, /id="create-privacy-heading"/);
  assert.match(demo, /id="interactive-receptionist-demo"/);
  assert.match(demo, /aria-labelledby="interactive-receptionist-heading"/);
  assert.match(demo, /id="interactive-receptionist-heading"/);
  assert.match(demo, /data-demo-transcript=""/);
  assert.match(demo, /data-voice-call-action=""/);
  assert.match(demo, /data-voice-status=\{voiceState\}/);
  assert.match(demo, /Start voice call/);
  assert.match(demo, /Or type what the caller would say/);
  assert.match(demo, /htmlFor=\{inputId\}/);
  assert.doesNotMatch(demo, /SandboxTestCallComingSoon/);
  assert.match(preview, /data-limitations="readonly"/);
  assert.match(preview, /id="create-pack-limitations-heading"/);
  assert.match(preview, /aria-labelledby="create-pack-limitations-heading"/);
  assert.match(preview, /Honest limitations/);
  assert.match(islands, /export function CalendarConnectSection\(\) \{/);
  assert.match(islands, /return null/);
  assert.doesNotMatch(islands, /CalendarConnectComingSoon/);
  assert.match(enabledIslands, /CalendarConnectPanel/);
});

test("static export setting is unchanged by create a11y polish", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});

test("/create Step 1 cannot native-submit before hydration", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /useSyncExternalStore\(/);
  assert.match(form, /HYDRATED_SERVER_SNAPSHOT = \(\) => false/);
  assert.match(form, /HYDRATED_CLIENT_SNAPSHOT = \(\) => true/);
  assert.match(form, /type="button"/);
  assert.match(form, /disabled=\{!hydrated\}/);
  assert.match(form, /data-create-hydrated=\{hydrated \? "true" : "false"\}/);
  assert.doesNotMatch(form, /<form\b/);
  assert.doesNotMatch(form, /requestSubmit\(/);
  assert.match(form, /onClick=\{onStep1\}/);
  assert.match(form, /event\.key !== "Enter"/);
  assert.match(form, /Loading form\.\.\./);
});


test("/create uses the same-origin on-demand scanner without reviving the retired paid endpoint", () => {
  const config = read("src/config/site.ts");
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  const scan = read("packages/onboarding-ingest/packages/website/scan/index.ts");
  assert.match(config, /onboardingScanEndpoint:\s*"\/api\/onboarding-scan"/);
  assert.doesNotMatch(config, /process\.env\.NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(later, /requestOnboardingScan\(endpoint, businessUrl\)/);
  assert.match(scan, /runScan\(url, \{ enabled: true \}\)/);
  assert.match(scan, /rate_limited/);
});
