import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const listPage = fs.readFileSync(
  path.join(ROOT, "src/app/integrations/page.tsx"),
  "utf8",
);
const providerPage = fs.readFileSync(
  path.join(ROOT, "src/app/integrations/[provider]/page.tsx"),
  "utf8",
);

test("integrations list stays pre-launch and drops dead notify CTA", () => {
  assert.match(listPage, /Planned integrations/);
  assert.match(listPage, /Ask about this integration/);
  assert.match(listPage, /No automated availability email is sent from this site/);
  assert.match(listPage, /not live connectors/i);
  assert.doesNotMatch(listPage, /Notify me when available/);
  assert.doesNotMatch(listPage, /Available integrations/);
  assert.doesNotMatch(listPage, /Tokens encrypted at rest using AES-256-GCM/);
  assert.doesNotMatch(listPage, /Full audit log of every sync/);
  assert.doesNotMatch(listPage, /OAuth 2\.0 flow with encrypted token storage\./);
  assert.doesNotMatch(listPage, /We'll email you when/i);
  assert.doesNotMatch(listPage, /to be notified when they&apos;re available/);
  assert.ok(!listPage.includes('href={isAvailable ? `/integrations/${provider.id}/` : "#"}'));
});

test("provider pages do not invent notify email or live crypto claims", () => {
  assert.match(providerPage, /Ask about this integration/);
  assert.match(providerPage, /does not send automated availability emails/);
  assert.match(providerPage, /coming soon — not a live connector/i);
  assert.match(providerPage, /Planned design: short-lived tokens/);
  assert.doesNotMatch(providerPage, /Notify me when available/);
  assert.doesNotMatch(providerPage, /We'll email you when this integration is ready/);
  assert.doesNotMatch(providerPage, /Tokens encrypted at rest using AES-256-GCM/);
  assert.doesNotMatch(providerPage, /Revoke access anytime from this page/);
  assert.doesNotMatch(providerPage, /No credential storage in browser/);
});
