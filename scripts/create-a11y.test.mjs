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
  assert.match(form, /aria-label="Create receptionist steps"/);
  assert.match(form, /aria-current=\{current \? "step" : undefined\}/);
  assert.match(form, /createJourneyStepStatusLabel/);
  assert.match(form, /createJourneyStepAnnouncement/);
  assert.match(form, /stepHeadingRef\.current\?\.focus\(\)/);
  assert.match(form, /tabIndex=\{-1\}/);
  assert.doesNotMatch(form, /live (phone|number) was assigned/i);
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
  assert.equal((form.match(/data-create-primary-action=""/g) || []).length, 4);
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

test("sandbox coming and limitations regions have labelled headings", () => {
  const page = read("src/app/create/page.tsx");
  const sandbox = read("src/components/SandboxTestCallComingSoon.tsx");
  const sandboxPanel = read("src/components/SandboxTestCallPanel.tsx");
  const preview = read("src/components/ReceptionistDraftPreview.tsx");
  const calendar = read("src/components/CalendarConnectComingSoon.tsx");
  const calendarPanel = read("src/components/CalendarConnectPanel.tsx");

  assert.match(page, /aria-labelledby="create-limits-heading"/);
  assert.match(page, /id="create-limits-heading"/);
  assert.match(page, /CreateIngestPrivacyNote/);
  const privacyNote = read("src/components/CreateIngestPrivacyNote.tsx");
  assert.match(privacyNote, /aria-labelledby="create-privacy-heading"/);
  assert.match(privacyNote, /id="create-privacy-heading"/);
  assert.match(sandbox, /Sandbox test call — under testing \/ coming/);
  assert.match(sandbox, /aria-labelledby="sandbox-test-call-heading"/);
  assert.match(sandbox, /aria-describedby=\{comingCopyId\}/);
  assert.match(sandboxPanel, /SandboxTestCallComingSoon/);
  assert.match(preview, /data-limitations="readonly"/);
  assert.match(preview, /id="create-pack-limitations-heading"/);
  assert.match(preview, /aria-labelledby="create-pack-limitations-heading"/);
  assert.match(preview, /Honest limitations/);
  assert.match(calendar, /Calendar connect — coming \/ under testing/);
  assert.match(calendar, /aria-labelledby="calendar-connect-heading"/);
  assert.match(calendarPanel, /CalendarConnectComingSoon/);
});

test("static export setting is unchanged by create a11y polish", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});
