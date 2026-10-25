import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/getting-started.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("getting-started does not publish workspaces, properties, invites, rules, channels, or test repairs", () => {
  assert.doesNotMatch(text, /Create Your Workspace/);
  assert.doesNotMatch(text, /Choose a workspace name/);
  assert.doesNotMatch(text, /Primary contact/);
  assert.doesNotMatch(text, /import a CSV/);
  assert.doesNotMatch(text, /Gas safety certificate/);
  assert.doesNotMatch(text, /EPC rating/);
  assert.doesNotMatch(text, /HMO licence/);
  assert.doesNotMatch(text, /Invite Your Team/);
  assert.doesNotMatch(text, /role-based access/);
  assert.doesNotMatch(text, /Admin.*Full access/);
  assert.doesNotMatch(text, /Manager.*Properties/);
  assert.doesNotMatch(text, /Contractor.*Assigned/);
  assert.doesNotMatch(text, /Viewer.*Read-only/);
  assert.doesNotMatch(text, /secure link/);
  assert.doesNotMatch(text, /Configure Repair Categories/);
  assert.doesNotMatch(text, /Plumbing|Electrical|Heating/);
  assert.doesNotMatch(text, /Set Up Safety Rules/);
  assert.doesNotMatch(text, /Gas smell/);
  assert.doesNotMatch(text, /No heating in winter/);
  assert.doesNotMatch(text, /Water leak affecting electrics/);
  assert.doesNotMatch(text, /Structural instability/);
  assert.doesNotMatch(text, /Fire safety equipment/);
  assert.doesNotMatch(text, /cannot be disabled/);
  assert.doesNotMatch(text, /Connect Your Channels/);
  assert.doesNotMatch(text, /website widget/);
  assert.doesNotMatch(text, /Email forwarding/);
  assert.doesNotMatch(text, /Phone.*Twilio/);
  assert.doesNotMatch(text, /API.*custom integrations/);
  assert.doesNotMatch(text, /Run a Test Repair/);
  assert.doesNotMatch(text, /test repair/);
  assert.doesNotMatch(text, /Configure Contractors/);
  assert.doesNotMatch(text, /Set Up Notifications/);
  assert.doesNotMatch(text, /Repair Lifecycle/);
  assert.doesNotMatch(text, /Safety Latches/);
  assert.match(text, /not a live onboarding/i);
  assert.match(text, /not a live setup/i);
  assert.match(text, /not applicable/i);
  assert.match(text, /not a live permission model/i);
  assert.match(text, /not a live rule set/i);
  assert.match(text, /not a live integration/i);
  assert.match(text, /not a live workflow/i);
});

test("getting-started description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});