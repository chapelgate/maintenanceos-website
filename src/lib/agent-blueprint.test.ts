import assert from "node:assert/strict";
import test from "node:test";
import {
  AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE,
  AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA,
  AGENT_BLUEPRINT_SCHEMA_VERSION,
  type AgentBlueprintV1,
  validateAgentBlueprintV1,
} from "./agent-blueprint.ts";

function validBlueprint(): AgentBlueprintV1 {
  return {
    schemaVersion: AGENT_BLUEPRINT_SCHEMA_VERSION,
    blueprintId: "abp_test0001",
    createdAt: "2026-09-27T13:30:00.000Z",
    compatibility: {
      productBaselineSha: AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA,
      productBaselineDate: AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE,
      runtimeContract: "maintenanceos-v1",
    },
    identity: {
      businessName: "Example Plumbing",
      website: "https://example.com/",
      locations: ["Liverpool"],
      contact: { phone: "+44 151 555 0100", email: "hello@example.com" },
    },
    agent: {
      type: "receptionist",
      objective: "Answer enquiries and capture messages.",
      greeting: "Thank you for calling Example Plumbing. How can we help?",
      language: "en-GB",
    },
    knowledge: {
      untrustedWebsiteContent: true,
      services: ["Boiler repair"],
      hours: "Mon-Fri 08:00-17:00",
      faqs: [{ question: "Do you cover Liverpool?", answer: "Yes." }],
      sources: [{
        url: "https://example.com/",
        fields: ["businessName", "services", "hours", "faqs"],
        sourceType: "jsonld",
        confidence: "high",
      }],
    },
    permissions: {
      allow: ["answer_information", "take_message"],
      deny: ["transfer_call"],
    },
    rules: {
      unavailableInformation: "say_not_on_file",
      humanTransfer: "disabled",
      forbiddenActions: [
        "financial_commitment",
        "autonomous_dispatch",
        "credential_disclosure",
        "policy_override",
        "unrestricted_external_action",
      ],
    },
    integrations: [{ kind: "telephony", connectorRef: "ttnc_primary", enabled: false }],
    privacy: { recordCalls: false, transcribeCalls: true, retentionDays: 30 },
    lifecycle: { stage: "draft" },
  };
}

test("accepts a strict v1 draft pinned to the current product baseline", () => {
  const value = validBlueprint();
  assert.deepEqual(validateAgentBlueprintV1(value), { ok: true, value });
});

test("fails closed on an older product baseline", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.compatibility.productBaselineSha = "cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8";
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /unsupported product baseline/);
});

test("rejects unexpected fields instead of silently accepting drift", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.agent.provider = "gemini";
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /agent\.provider: unexpected field/);
});

test("rejects credential-like fields anywhere in the blueprint", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.integrations[0].api_key = "never-allowed";
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /credential-like fields are forbidden/);
});

test("requires crawled website knowledge to stay marked untrusted", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.knowledge.untrustedWebsiteContent = false;
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /must be true/);
});

test("prevents permission allow/deny ambiguity", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.permissions.allow.push("transfer_call");
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /both allowed and denied/);
});

test("rejects non-HTTPS business and provenance URLs", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.identity.website = "http://example.com";
  value.knowledge.sources[0].url = "http://example.com/source";
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.join("\n"), /identity\.website: expected absolute https URL/);
    assert.match(result.errors.join("\n"), /sources\[0\]\.url: expected absolute https URL/);
  }
});

test("rejects unknown capabilities and lifecycle states", () => {
  const value = validBlueprint() as unknown as Record<string, any>;
  value.permissions.allow = ["run_shell"];
  value.lifecycle.stage = "live_without_test";
  const result = validateAgentBlueprintV1(value);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.join("\n"), /permissions\.allow\[0\]: invalid value/);
    assert.match(result.errors.join("\n"), /lifecycle\.stage: invalid value/);
  }
});
