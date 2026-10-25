import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/billing-subscriptions.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("billing-subscriptions does not publish a live checkout or deletion clock", () => {
  assert.doesNotMatch(text, /Stripe|GoCardless|Amex|Bacs/);
  assert.doesNotMatch(text, /Settings → Billing/);
  assert.doesNotMatch(text, /Net 30/);
  assert.doesNotMatch(text, /90 days|30 days/);
  assert.doesNotMatch(text, /MOS-\{YYYY\}/);
  assert.doesNotMatch(text, /update-payment|invoice-history|enterprise-contact/);
  assert.doesNotMatch(text, /Starter|Professional|Enterprise/);
  assert.doesNotMatch(text, /Okta|Azure AD|SSO/);
  assert.doesNotMatch(text, /£\d/);
  assert.match(text, /no published price list/i);
  assert.match(text, /request/i);
  assert.match(text, /not a live subscription/i);
  assert.match(text, /not a live checkout/i);
  assert.match(text, /not a live setup/i);
  assert.match(text, /not a live SLA/i);
  assert.match(text, /does not publish a VAT number/i);
  assert.match(text, /not applicable/i);
});

test("billing-subscriptions description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
