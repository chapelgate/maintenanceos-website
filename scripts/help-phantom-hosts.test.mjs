import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const getting = fs.readFileSync(path.join(HELP, "getting-help.mdx"), "utf8");
const banned = [
  "youtube.com/@MaintenanceOS",
  "community.maintenanceos.co.uk",
  "roadmap.maintenanceos.co.uk",
  "docs.maintenanceos.co.uk",
  "status.maintenanceos.co.uk",
];

test("help corpus does not publish phantom community, docs, or status hosts", () => {
  for (const name of fs.readdirSync(HELP)) {
    if (!name.endsWith(".mdx")) continue;
    const text = fs.readFileSync(path.join(HELP, name), "utf8");
    for (const host of banned) {
      assert.equal(text.includes(host), false, `${name} still publishes ${host}`);
    }
  }
});

test("Getting Help says those destinations are not live", () => {
  assert.match(getting, /does not publish a YouTube channel/i);
  assert.match(getting, /not a live video library/i);
  assert.match(getting, /not a live community/i);
  assert.match(getting, /not a live status page/i);
  assert.match(getting, /not a live training programme/i);
  assert.match(getting, /info@chapelgatetechnologies\.com/);
  assert.match(getting, /0800 111 999/);
  assert.doesNotMatch(getting, /Public Roadmap/);
});
