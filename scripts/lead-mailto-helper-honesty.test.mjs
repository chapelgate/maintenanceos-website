import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const form = fs.readFileSync(
  path.join(ROOT, "src/components/LeadCaptureForm.tsx"),
  "utf8",
);

test("lead helper scopes mailto draft copy to missing form endpoint", () => {
  assert.match(form, /When no form endpoint is configured/);
  assert.match(form, /nothing is sent until you press send/i);
  assert.match(form, /prefilled WorkSmartOS draft/);
  assert.doesNotMatch(
    form,
    /Only email is required\. Everything else is optional\. Submitting opens your email app/,
  );
});
