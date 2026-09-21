import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("static export setting is unchanged", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});

test("SiteHeader stays a server component with Escape on native details", () => {
  const header = read("src/components/SiteHeader.tsx");
  assert.doesNotMatch(header, /^["']use client["']/);
  assert.doesNotMatch(header, /useEffect/);
  assert.match(header, /Escape/);
  assert.match(header, /header details\[open\]/);
  assert.match(header, /dangerouslySetInnerHTML/);
});

test("/create first-load form defers scan and pack steps", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /next\/dynamic/);
  assert.match(form, /CreateReceptionistLaterSteps/);
  assert.match(form, /ssr:\s*false/);
  assert.doesNotMatch(form, /from ["']@\/lib\/onboarding-create["']/);
  assert.doesNotMatch(form, /from ["']@\/lib\/lead-adapter["']/);
  assert.doesNotMatch(form, /from ["']@\/config\/site["']/);
  assert.doesNotMatch(form, /ReceptionistDraftPreview/);
});

test("/create default path does not import companion client islands", () => {
  const page = read("src/app/create/page.tsx");
  const form = read("src/components/CreateReceptionistForm.tsx");
  const islands = read("src/components/create-funnel-islands.tsx");
  const enabled = read("src/components/create-funnel-islands.enabled.tsx");
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  const config = read("next.config.ts");

  assert.doesNotMatch(page, /from ["']@\/components\/CreateJourney["']/);
  assert.doesNotMatch(page, /from ["']@\/components\/CalendarConnectPanel["']/);
  assert.doesNotMatch(page, /from ["']@\/components\/SandboxTestCallPanel["']/);
  assert.match(page, /CreateIngestPrivacyNote/);
  assert.doesNotMatch(form, /CreateIngestPrivacyNote/);

  assert.doesNotMatch(later, /from ["']@\/components\/CreateJourney["']/);
  assert.doesNotMatch(later, /from ["']@\/components\/CalendarConnectPanel["']/);
  assert.doesNotMatch(later, /from ["']@\/components\/SandboxTestCallPanel["']/);

  assert.doesNotMatch(islands, /from ["']@\/components\/CreateJourney["']/);
  assert.doesNotMatch(islands, /from ["']@\/components\/CalendarConnectPanel["']/);
  assert.doesNotMatch(islands, /from ["']@\/components\/SandboxTestCallPanel["']/);
  assert.match(islands, /CreateReceptionistForm/);
  assert.match(islands, /SandboxTestCallComingSoon/);
  assert.match(islands, /CalendarConnectComingSoon/);

  assert.match(enabled, /from ["']@\/components\/CreateJourney["']/);
  assert.match(enabled, /from ["']@\/components\/CalendarConnectPanel["']/);
  assert.match(config, /create-funnel-islands\.enabled/);
  assert.match(config, /NormalModuleReplacementPlugin/);
  assert.match(config, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED/);
  assert.match(config, /NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED/);
});

test("root layout does not mark chrome as a client island", () => {
  const layout = read("src/app/layout.tsx");
  assert.doesNotMatch(layout, /^["']use client["']/);
  assert.match(layout, /SiteHeader/);
  assert.match(layout, /weight:\s*\[["']400["'],\s*["']600["']\]/);
  assert.match(layout, /display:\s*["']swap["']/);
});
