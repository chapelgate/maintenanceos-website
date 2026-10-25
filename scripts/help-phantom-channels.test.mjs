import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const read = (name) => fs.readFileSync(path.join(HELP, name), "utf8");
const getting = read("getting-help.mdx");
const banned = [
  "api.maintenanceos.co.uk",
  "app.maintenanceos.co.uk",
  "support@maintenanceos.co.uk",
  "accessibility@maintenanceos.co.uk",
];

test("help corpus does not publish a live API host, app host, or staff inbox", () => {
  for (const name of fs.readdirSync(HELP)) {
    if (!name.endsWith(".mdx")) continue;
    const text = read(name);
    for (const host of banned) {
      assert.equal(text.includes(host), false, `${name} still publishes ${host}`);
    }
  }
});

test("channel pages say those destinations are not live", () => {
  assert.match(read("api-quickstart.mdx"), /does not publish a public API host/i);
  assert.match(read("api-quickstart.mdx"), /not a live API/i);
  assert.match(read("integration-overview.mdx"), /not a live API/i);
  assert.match(read("mobile-app.mdx"), /does not publish an app host/i);
  assert.match(read("mobile-app.mdx"), /not a live app/i);
  assert.match(read("troubleshooting-common-issues.mdx"), /no public support inbox/i);
  assert.match(read("troubleshooting-common-issues.mdx"), /not a live response target/i);
  assert.match(read("accessibility-features.mdx"), /does not publish an accessibility inbox/i);
  assert.doesNotMatch(read("troubleshooting-common-issues.mdx"), /1 hour business hours/);
  assert.doesNotMatch(read("accessibility-features.mdx"), /2 business days/);
});

test("Getting Help does not publish a feedback desk or onboarding call", () => {
  assert.doesNotMatch(getting, /Send Feedback/);
  assert.doesNotMatch(getting, /Admin onboarding call/);
  assert.match(getting, /not a live feedback channel/i);
  assert.match(getting, /not a live onboarding call/i);
  assert.match(getting, /early-access@maintenanceos\.co\.uk/);
  assert.match(getting, /0800 111 999/);
});
