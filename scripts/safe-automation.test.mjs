import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("safe automation copy has one canonical three-stage message", () => {
  const src = read("src/config/safe-automation.ts");
  assert.match(src, /AI assists\. Server rules control\. Authorised people approve\./);
  assert.match(src, /Capture and structure/);
  assert.match(src, /Enforce the boundaries/);
  assert.match(src, /Clear consequential actions/);
});

test("AI automation and human/rule gates are explicit", () => {
  const src = read("src/config/safe-automation.ts");
  assert.match(src, /Collect caller and maintenance details/);
  assert.match(src, /Critical-safety clearance/);
  assert.match(src, /Escalation \/ HUMAN_REVIEW/);
  assert.match(src, /payment, refund, compensation, fee-waiver, or client-money/);
});

test("forbidden autonomous claims remain explicit", () => {
  const src = read("src/config/safe-automation.ts");
  assert.match(src, /Invent a booking, dispatch, engineer arrival, refund, or account change/);
  assert.match(src, /Override a safety, lifecycle, approval, or money prohibition/);
  assert.match(src, /safety assurances beyond approved guidance/);
});

test("visual model uses one shared config and no diagram dependency", () => {
  const component = read("src/components/SafeAutomationModel.tsx");
  const pkg = read("package.json");
  assert.match(component, /safeAutomationStages\.map/);
  assert.match(component, /AI can automate/);
  assert.match(component, /Rules or people must clear/);
  assert.match(component, /grid gap-4 lg:grid-cols-3/);
  assert.match(component, /hidden .* lg:block/);
  assert.doesNotMatch(component, /min-w-\[[0-9]+px\]/);
  assert.doesNotMatch(pkg, /mermaid|reactflow|xyflow|d3|gojs/i);
});

test("major buyer pages reuse the same safe-automation component", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/how-it-works/page.tsx",
    "src/app/ai-receptionist/page.tsx",
    "src/app/security/page.tsx",
    "src/app/features/page.tsx",
    "src/app/property-maintenance-software/page.tsx",
  ];
  for (const file of files) {
    const src = read(file);
    assert.match(src, /SafeAutomationModel/, file);
    assert.match(src, /<SafeAutomationModel/, file);
  }
});

test("AI-readable summaries use the same canonical automation boundary", () => {
  for (const file of ["public/llms.txt", "public/llms-full.txt"]) {
    assert.match(
      read(file),
      /AI assists\. Server rules control\. Authorised people approve\./,
      file,
    );
  }
  const faq = read("src/content/faqs.ts");
  assert.match(faq, /AI assists with intake/);
  assert.match(faq, /authorised human clearance/);
});

test("safe automation claims stay linked to the signed register", () => {
  const doc = read("docs/STEP8_SAFE_AUTOMATION_MODEL.md");
  for (const id of ["V-03", "V-04", "O-03", "O-04", "O-05", "O-06", "S-03"]) {
    assert.ok(doc.includes(`${id}`), `missing claim source ${id}`);
  }
});
