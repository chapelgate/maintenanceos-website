import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/emergency-procedures.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("emergency-procedures does not publish a live safety tool", () => {
  assert.doesNotMatch(text, /0800 111 999|\b105\b|999.*first|\b105\s*\(Power/);
  assert.doesNotMatch(text, /duty.manager|on.call|SLA.*clock|tiered.response/i);
  assert.doesNotMatch(text, /gas.leak|carbon.monoxide|water.main|structural.collapse/i);
  assert.doesNotMatch(text, /incident.report|insurance.workflow|compliance.audit/i);
  assert.doesNotMatch(text, /Settings →|Reports →/);
  assert.match(text, /not a live safety tool/i);
  assert.match(text, /not applicable/i);
});

test("emergency-procedures description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
