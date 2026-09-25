import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("homepage leads with customer outcome before architecture", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /Turn maintenance requests into clear, controlled work\./);
  assert.match(
    page,
    /helps UK landlords, letting agents,[\s\S]*capture maintenance[\s\S]*structure the work[\s\S]*escalate critical cases[\s\S]*approvals with authorised people/,
  );
  assert.match(page, /What your team gets/);
  assert.match(page, /Capture the request clearly/);
  assert.match(page, /Surface critical cases/);
  assert.match(page, /Keep decisions with your team/);
  assert.match(page, /Keep work traceable/);
  assert.match(page, /How MaintenanceOS keeps control behind the scenes/);
  assert.ok(
    page.indexOf("What your team gets") <
      page.indexOf("How MaintenanceOS keeps control behind the scenes"),
    "buyer benefits must appear before technical control architecture",
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
    "src/app/ai-receptionist/page.tsx": /Capture maintenance calls without handing control to the AI/,
    "src/app/how-it-works/page.tsx": /From maintenance request to controlled follow-up/,
    "src/app/features/page.tsx": /What MaintenanceOS can do — and what is still being tested/,
    "src/app/industries/page.tsx": /Maintenance workflows for the teams who run them/,
    "src/app/pricing/page.tsx": /title=\{pricing\.title\}/,
    "src/app/demo/page.tsx": /Start from your website URL/,
    "src/app/security/page.tsx": /Security and accountability by design/,
    "src/app/contact/page.tsx": /Talk to a person/,
  };
  for (const [file, pattern] of Object.entries(cases)) {
    assert.match(read(file), pattern, file + " must have a plain first-screen proposition");
  }
});

test("major-page first screens retain honesty and no invented live service", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/ai-receptionist/page.tsx",
    "src/app/how-it-works/page.tsx",
    "src/app/features/page.tsx",
    "src/app/industries/page.tsx",
    "src/app/pricing/page.tsx",
    "src/app/demo/page.tsx",
    "src/app/security/page.tsx",
    "src/app/contact/page.tsx",
  ];
  const joined = files.map(read).join("\n");
  assert.match(joined, /pre-launch/i);
  assert.match(joined, /under testing/i);
  assert.doesNotMatch(joined, /24\/7 AI receptionist/i);
  assert.doesNotMatch(joined, /live always-on receptionist/i);
  assert.doesNotMatch(joined, /guaranteed/i);
});
