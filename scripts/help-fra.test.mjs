import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/fire-risk-assessment.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("fire-risk-assessment does not publish a live compliance tool", () => {
  assert.doesNotMatch(text, /Regulatory Reform|Fire Safety Order 2005|1–3 years/);
  assert.doesNotMatch(text, /Fire Safety tab|Auto-warning|New Assessment/);
  assert.doesNotMatch(text, /Immediate.*24-hour|High.*30-day|Medium.*90-day/);
  assert.doesNotMatch(text, /Missing smoke alarms|BS EN 1869|IFE|FIA|NEBOSH/);
  assert.doesNotMatch(text, /Fire Safety Portfolio|golden thread|18m/);
  assert.doesNotMatch(text, /fire-door-inspection|emergency-lighting|fire-alarm-servicing/);
  assert.doesNotMatch(text, /Reports →|Property →/);
  assert.match(text, /not a live compliance tool/i);
  assert.match(text, /not a live tracker/i);
  assert.match(text, /not a live workflow/i);
  assert.match(text, /not applicable/i);
});

test("fire-risk-assessment description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
