import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("homepage leads with customer outcome before architecture", () => {
  const page = read("src/app/[locale]/page.tsx");
  assert.match(page, /AI intake for repair reports\. A person still clears anything dangerous\./);
  assert.match(
    page,
    /Capture caller details 24\/7 in natural UK terminology\./,
  );
  assert.match(page, /What your team gets/);
  assert.match(page, /Capture Caller Details/);
  assert.match(page, /Surface Critical Hazards/);
  assert.match(page, /Fixed Rule Engine/);
  assert.match(page, /Immutable Audit Trail/);
  assert.match(page, /<SafeAutomationLink \/>/);
  assert.ok(
    page.indexOf("What your team gets") <
      page.indexOf("<SafeAutomationLink />"),
    "buyer benefits must appear before the link to the safety controls",
  );
});

test("canonical value proposition is claims-linked and status-honest", () => {
  const doc = read("VALUE_PROPOSITION.md");
  assert.match(doc, /Turn maintenance requests into clear, controlled work/);
  assert.match(doc, /V-03, O-02/);
  assert.match(doc, /O-04, O-05/);
  assert.match(doc, /O-03, O-04/);
  assert.match(doc, /O-02, S-03/);
  assert.match(doc, /pre-launch/i);
  assert.match(doc, /under testing/i);
  assert.match(doc, /Technical controls are proof, not the primary sales message/);
});

test("major buyer pages state a plain outcome in the first-screen source", () => {
  const cases = {
    "src/app/[locale]/ai-receptionist/page.tsx": /Capture maintenance calls without handing control to the AI/,
    "src/app/[locale]/how-it-works/page.tsx": /From maintenance request to controlled follow-up/,
    "src/app/[locale]/features/page.tsx": /What MaintenanceOS can do.*what is in preview/,
    "src/app/[locale]/industries/page.tsx": /Repair intake for the people who answer for repairs/,
    "src/app/[locale]/pricing/page.tsx": /title=\{pricing\.title\}/,
    "src/app/[locale]/demo/page.tsx": /Start from your website URL/,
    "src/app/[locale]/security/page.tsx": /How we keep your data separate and your actions on record/,
    "src/app/[locale]/contact/page.tsx": /Talk to a person/,
  };
  for (const [file, pattern] of Object.entries(cases)) {
    assert.match(read(file), pattern, file + " must have a plain first-screen proposition");
  }
});

test("major-page first screens retain honesty and no invented live service", () => {
  const files = [
    "src/app/[locale]/page.tsx",
    "src/app/[locale]/ai-receptionist/page.tsx",
    "src/app/[locale]/how-it-works/page.tsx",
    "src/app/[locale]/features/page.tsx",
    "src/app/[locale]/industries/page.tsx",
    "src/app/[locale]/pricing/page.tsx",
    "src/app/[locale]/demo/page.tsx",
    "src/app/[locale]/security/page.tsx",
    "src/app/[locale]/contact/page.tsx",
  ];
  const joined = files.map(read).join("\n");
  assert.match(joined, /pre-launch/i);
  assert.match(joined, /preview/i);
  assert.doesNotMatch(joined, /24\/7 AI receptionist/i);
  assert.doesNotMatch(joined, /live always-on receptionist/i);
  assert.doesNotMatch(joined, /guaranteed/i);
  assert.doesNotMatch(joined, /Gemini/i);
  assert.doesNotMatch(joined, /Fonio/i);
});