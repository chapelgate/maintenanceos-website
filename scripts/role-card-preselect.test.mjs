import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("home role cards link each template into /create with a role slug", () => {
  const offers = read("src/components/CustomerAgentOffers.tsx");
  assert.match(offers, /agentRoleSlug\(template\.type\)/);
  assert.match(offers, /\/create\/\?role=/);
  assert.match(read("src/lib/agent-selection.ts"), /maintenance_desk[\s\S]*maintenance-desk|replaceAll\("_", "-"\)/);
});

test("create reads the role on the client and opens step 3 selected", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(form, /window\.location\.search/);
  assert.match(form, /agentTypeFromRoleSlug/);
  assert.match(form, /initialStep=\{presetRole \? 3 : undefined\}/);
  assert.match(form, /initialAgentType=\{presetRole\}/);
  assert.match(form, /setPresetDismissed\(true\)/);
  assert.match(later, /useState<CreateJourneyStep>\(initialStep \?\? 2\)/);
  assert.match(later, /useState<AgentType \| null>\(\s*initialAgentType,\s*\)/);
  assert.match(later, /if \(step !== 2 \|\| !businessUrl\.trim\(\)\) return/);
  assert.match(later, /if \(!initialAgentType\) setSelectedAgentType\(null\)/);
  assert.match(later, /if \(!businessUrl\.trim\(\)\) \{\s*onBackToWebsite\(\)/);
});

test("choosing a role still requires an HTTPS website", () => {
  const selection = read("src/lib/agent-selection.ts");
  assert.match(selection, /An HTTPS business website is required before choosing an agent\./);
});
