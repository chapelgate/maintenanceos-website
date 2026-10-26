import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/subprocessors/page.tsx"),
  "utf8",
);

test("subprocessors page stays a draft planned register", () => {
  assert.match(page, /Draft planned register only/i);
  assert.match(page, /Pending legal review/i);
  assert.match(page, /Pre-launch draft/);
  assert.match(page, /Website host/);
  assert.match(page, /Planned product/);
  assert.doesNotMatch(
    page,
    /The following subprocessors process personal data in connection with the\s+WorkSmartOS website and MaintenanceOS product/,
  );
});

test("subprocessors page does not claim live Twilio SendGrid or Google website processing", () => {
  assert.match(page, /does not send enquiry data through Twilio, SendGrid, or Google APIs/i);
  assert.match(page, /does not operate a live phone line/i);
  assert.match(page, /not a live Twilio telephony claim/i);
  assert.match(page, /not a live SendGrid mail claim/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
