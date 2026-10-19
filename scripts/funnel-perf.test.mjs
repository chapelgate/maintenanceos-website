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

test("/create defers later steps without weakening the hydration-safe entry", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /next\/dynamic/);
  assert.match(form, /import\(["']@\/components\/CreateReceptionistLaterSteps["']\)/);
  assert.match(form, /ssr:\s*false/);
  assert.match(form, /CreateLaterStepsFallback/);
  assert.match(form, /useSyncExternalStore/);
  assert.match(form, /disabled=\{!hydrated\}/);
  assert.doesNotMatch(form, /<form\b/);
  assert.doesNotMatch(form, /from ["']@\/lib\/onboarding-create["']/);
  assert.doesNotMatch(form, /from ["']@\/lib\/lead-adapter["']/);
  assert.doesNotMatch(form, /from ["']@\/config\/site["']/);
  assert.doesNotMatch(form, /ReceptionistDraftPreview/);
});

test("/create default path includes the public journey but code-splits the interactive demo", () => {
  const page = read("src/app/create/page.tsx");
  const form = read("src/components/CreateReceptionistForm.tsx");
  const journey = read("src/components/CreateJourney.tsx");
  const islands = read("src/components/create-funnel-islands.tsx");
  const enabled = read("src/components/create-funnel-islands.enabled.tsx");
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  const config = read("next.config.ts");

  assert.equal(page.includes("@/components/CreateJourney"), false);
  assert.equal(page.includes("@/components/CalendarConnectPanel"), false);
  assert.equal(page.includes("@/components/SandboxTestCallPanel"), false);
  assert.match(page, /CreateIngestPrivacyNote/);
  assert.doesNotMatch(form, /CreateIngestPrivacyNote/);

  assert.equal(later.includes('from "@/components/CreateJourney"'), false);
  assert.equal(later.includes('from "@/components/CalendarConnectPanel"'), false);
  assert.equal(later.includes('from "@/components/SandboxTestCallPanel"'), false);

  assert.equal(islands.includes("@/components/CreateJourney"), true);
  assert.equal(islands.includes("@/components/CalendarConnectPanel"), false);
  assert.equal(islands.includes("SandboxTestCallComingSoon"), false);
  assert.equal(islands.includes("CalendarConnectComingSoon"), false);

  assert.equal(journey.includes("next/dynamic"), true);
  assert.equal(journey.includes('import("@/components/SandboxTestCallPanel")'), true);
  assert.match(journey, /ssr:\s*false/);
  assert.equal(journey.includes('from "@/components/SandboxTestCallPanel"'), false);

  assert.equal(enabled.includes("@/components/CreateJourney"), true);
  assert.equal(enabled.includes("@/components/CalendarConnectPanel"), true);
  assert.equal(config.includes("create-funnel-islands.enabled"), true);
  assert.equal(config.includes("turbopack"), true);
  assert.equal(config.includes("resolveAlias"), true);
  assert.doesNotMatch(config, /NormalModuleReplacementPlugin|webpack:\s*\(/);
  assert.equal(config.includes("NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED"), true);
  assert.equal(config.includes("NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED"), true);
});

test("root layout does not mark chrome as a client island", () => {
  const layout = read("src/app/layout.tsx");
  assert.doesNotMatch(layout, /^["']use client["']/);
  assert.match(layout, /SiteHeader/);
  assert.match(layout, /localFont/);
  assert.match(layout, /Inter-Regular\.woff2/);
  assert.match(layout, /Inter-Medium\.woff2/);
  assert.match(layout, /display:\s*["']swap["']/);
  assert.doesNotMatch(layout, /fonts\.googleapis\.com/);
});
