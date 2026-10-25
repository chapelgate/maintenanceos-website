import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/user-management.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("user-management does not publish invites, SSO, SCIM, or audit export", () => {
  assert.doesNotMatch(text, /Settings → Users/);
  assert.doesNotMatch(text, /magic link/i);
  assert.doesNotMatch(text, /Okta|Azure AD|OneLogin|Ping Identity|Google Workspace/);
  assert.doesNotMatch(text, /SCIM/);
  assert.doesNotMatch(text, /sso-azure-ad|sso-okta|scim-provisioning|audit-log-export/);
  assert.doesNotMatch(text, /Session timeout/);
  assert.doesNotMatch(text, /7 years/);
  assert.match(text, /not a live account control/i);
  assert.match(text, /not a live permission model/i);
  assert.match(text, /not a live setup/i);
  assert.match(text, /not a live configuration/i);
  assert.match(text, /not applicable/i);
});

test("user-management description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
