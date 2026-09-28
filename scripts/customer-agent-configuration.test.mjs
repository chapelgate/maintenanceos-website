import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("create journey exposes bounded customer agent configuration", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  const panel = read("src/components/AgentCustomerConfiguration.tsx");
  const core = read("src/lib/onboarding-create-core.ts");

  assert.match(later, /AgentCustomerConfiguration/);
  assert.match(later, /customerConfigurationForBlueprint/);
  assert.match(later, /applyCustomerAgentConfiguration/);
  assert.match(panel, /Voice preference/);
  assert.match(panel, /What this role may handle/);
  assert.match(panel, /Human transfer/);
  assert.match(panel, /type="checkbox"/);
  assert.match(panel, /type="radio"/);
  assert.match(core, /label: "Configure"/);
  assert.match(core, /label: "Review & Pack"/);
});

test("website configuration is explicitly isolated from live phone routing", () => {
  const panel = read("src/components/AgentCustomerConfiguration.tsx");
  const config = read("src/lib/agent-customer-configuration.ts");

  assert.match(panel, /do\s+not provision a number/);
  assert.match(panel, /alter a live phone\s+line/);
  assert.match(panel, /does not select[\s\S]*live production voice/);
  assert.doesNotMatch(config, /twilio|webhook|voice_url|incomingphonenumber/i);
});

test("configuration uses approved role maxima and cannot expand permissions", () => {
  const config = read("src/lib/agent-customer-configuration.ts");
  assert.match(config, /agentTemplateFor/);
  assert.match(config, /cannot expand role permissions/);
  assert.match(config, /Requested action is not available for this agent role/);
  assert.match(config, /Human transfer is not available for this agent role/);
});
