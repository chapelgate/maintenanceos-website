import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("public home offers the same controlled agent roles used by setup", () => {
  const home = read("src/app/page.tsx");
  const offers = read("src/components/CustomerAgentOffers.tsx");
  const selector = read("src/components/AgentTypeSelector.tsx");

  assert.match(home, /<CustomerAgentOffers \/>/);
  assert.match(offers, /AGENT_TEMPLATES\.map/);
  assert.match(selector, /AGENT_TEMPLATES\.map/);
  assert.match(offers, /Choose what you want the AI to do/);
  assert.match(offers, /href=\{`\/create\/\?role=\$\{agentRoleSlug\(template\.type\)\}`\}/);
  assert.match(offers, /agentRoleSlug/);
});

test("customer offer surface stays claims-safe", () => {
  const offers = read("src/components/CustomerAgentOffers.tsx");
  assert.match(offers, /Early access/);
  assert.match(offers, /does not[\s\S]*provision a number/);
  assert.match(offers, /activate a live phone service/);
  assert.doesNotMatch(offers, /buy now|live today|always-on|guaranteed/i);
});
