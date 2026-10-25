import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const read = (name) => fs.readFileSync(path.join(HELP, name), "utf8");
const ns = read("notification-settings.mdx");
const ti = read("troubleshooting-common-issues.mdx");
const tp = read("tenant-portal.mdx");
const ra = read("reports-analytics.mdx");
const ma = read("mobile-app.mdx");

test("notification-settings does not publish live channels, Slack setup, or webhook events", () => {
  assert.doesNotMatch(ns, /Slack app install/);
  assert.doesNotMatch(ns, /Add to Slack/);
  assert.doesNotMatch(ns, /Authorise the MaintenanceOS app/);
  assert.doesNotMatch(ns, /Settings → Integrations → Webhooks/);
  assert.doesNotMatch(ns, /X-MaintenanceOS-Signature/);
  assert.doesNotMatch(ns, /Send Test Notification/);
  assert.match(ns, /not a live notification service/i);
  assert.match(ns, /not a live configuration/i);
  assert.match(ns, /not applicable/i);
});

test("troubleshooting does not publish live integration setup or API keys", () => {
  assert.doesNotMatch(ti, /Settings → Integrations → Slack\/Teams/);
  assert.doesNotMatch(ti, /Settings → Integrations → \[Platform\] → Sync Status/);
  assert.doesNotMatch(ti, /Reconnect integration/);
  assert.doesNotMatch(ti, /Settings → Integrations → Webhooks → Delivery History/);
  assert.doesNotMatch(ti, /Send Test Event/);
  assert.doesNotMatch(ti, /Settings → Integrations → API Keys/);
  assert.doesNotMatch(ti, /API key may be revoked/);
  assert.match(ti, /not a live support process/i);
  assert.match(ti, /not a live response target/i);
  assert.match(ti, /not applicable/i);
});

test("tenant-portal does not publish live subdomain or setup steps", () => {
  assert.doesNotMatch(tp, /yourcompany\.maintenanceos\.co\.uk/);
  assert.doesNotMatch(tp, /Settings → Tenant Portal → Enable/);
  assert.doesNotMatch(tp, /Bulk import/);
  assert.doesNotMatch(tp, /Self-signup/);
  assert.doesNotMatch(tp, /Repair must be assigned/);
  assert.doesNotMatch(tp, /Contractor must be assigned/);
  assert.doesNotMatch(tp, /Settings → Tenant Portal → Repair Form/);
  assert.doesNotMatch(tp, /CNAME setup/);
  assert.doesNotMatch(tp, /Reports → Tenant Portal/);
  assert.match(tp, /not a live self-service portal/i);
  assert.match(tp, /not a live setup/i);
  assert.match(tp, /not applicable/i);
  assert.match(tp, /not verified/i);
});

test("reports-analytics does not publish live reports, API rate limits, or audit exports", () => {
  assert.doesNotMatch(ra, /Reports →/);
  assert.doesNotMatch(ra, /SLA compliance/);
  assert.doesNotMatch(ra, /First Response Time/);
  assert.doesNotMatch(ra, /Contractor Performance/);
  assert.doesNotMatch(ra, /Compliance Dashboard/);
  assert.doesNotMatch(ra, /Financial Reports/);
  assert.doesNotMatch(ra, /Portfolio Health/);
  assert.doesNotMatch(ra, /Settings → Integrations/);
  assert.doesNotMatch(ra, /100 requests\/minute/);
  assert.doesNotMatch(ra, /Audit Exports/);
  assert.doesNotMatch(ra, /Gas safety certificate register/);
  assert.match(ra, /not a live reporting suite/i);
  assert.match(ra, /not a live API/i);
  assert.match(ra, /not applicable/i);
});

test("mobile-app does not publish live PWA features, push setup, or native app plans", () => {
  assert.doesNotMatch(ma, /Installable.*Add to home screen/);
  assert.doesNotMatch(ma, /Offline-capable/);
  assert.doesNotMatch(ma, /Push notifications/);
  assert.doesNotMatch(ma, /Settings → Notifications → Push/);
  assert.doesNotMatch(ma, /Allow permission prompt/);
  assert.doesNotMatch(ma, /Deep link/);
  assert.doesNotMatch(ma, /iOS 16\.4/);
  assert.doesNotMatch(ma, /Chrome 70/);
  assert.doesNotMatch(ma, /App Store.*planned/);
  assert.doesNotMatch(ma, /Feature parity/);
  assert.doesNotMatch(ma, /Siri Shortcuts/);
  assert.doesNotMatch(ma, /Android Intents/);
  assert.match(ma, /not a live app/i);
  assert.match(ma, /not applicable/i);
});
