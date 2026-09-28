import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentBlueprintDraft } from "./agent-selection.ts";
import {
  applyCustomerAgentConfiguration,
  customerActionOptionsForBlueprint,
  customerConfigurationForBlueprint,
  customerTransferSupported,
  type CustomerAgentConfiguration,
} from "./agent-customer-configuration.ts";

const BASE = {
  businessName: "Acme Services",
  businessUrl: "https://acme.example/",
  blueprintId: "abp_customerconfig01",
  createdAt: "2026-09-28T10:15:00.000Z",
} as const;

function blueprint(type: Parameters<typeof buildAgentBlueprintDraft>[0]["type"]) {
  return buildAgentBlueprintDraft({ ...BASE, type });
}

test("default customer configuration mirrors each role without widening it", () => {
  for (const type of [
    "receptionist",
    "maintenance_desk",
    "booking_assistant",
    "customer_service",
    "sales_enquiry",
    "custom",
  ] as const) {
    const original = blueprint(type);
    const configuration = customerConfigurationForBlueprint(original);
    const applied = applyCustomerAgentConfiguration(original, configuration);

    assert.equal(configuration.voiceProfile, "choose_later");
    assert.deepEqual(applied.permissions.allow, original.permissions.allow);
    assert.deepEqual(applied.permissions.deny, original.permissions.deny);
    assert.equal(applied.rules.humanTransfer, original.rules.humanTransfer);
    assert.equal(applied.lifecycle.stage, "draft");
    assert.equal(applied.privacy.recordCalls, false);
    assert.equal(applied.privacy.transcribeCalls, false);
    assert.equal(applied.privacy.retentionDays, 0);
  }
});

test("maintenance role can narrow maintenance jobs and transfer but cannot add new capabilities", () => {
  const original = blueprint("maintenance_desk");
  assert.deepEqual(
    customerActionOptionsForBlueprint(original).map((item) => item.id),
    ["maintenance_jobs"],
  );
  assert.equal(customerTransferSupported(original), true);

  const applied = applyCustomerAgentConfiguration(original, {
    voiceProfile: "uk_warm",
    enabledActions: [],
    humanTransfer: "disabled",
  });

  assert.deepEqual(applied.permissions.allow, [
    "answer_information",
    "take_message",
  ]);
  assert.ok(applied.permissions.deny.includes("create_maintenance_job"));
  assert.ok(applied.permissions.deny.includes("transfer_call"));
  assert.equal(applied.rules.humanTransfer, "disabled");
  assert.equal(applied.agent.voiceProfile, "uk_warm");

  assert.throws(
    () =>
      applyCustomerAgentConfiguration(original, {
        voiceProfile: "uk_warm",
        enabledActions: ["appointments"],
        humanTransfer: "disabled",
      }),
    /not available for this agent role/,
  );
});

test("booking role keeps appointment capabilities paired and toggles only calendar intent", () => {
  const original = blueprint("booking_assistant");
  assert.deepEqual(
    customerActionOptionsForBlueprint(original).map((item) => item.id),
    ["appointments"],
  );
  assert.equal(customerTransferSupported(original), false);

  const calendar = original.integrations.find((item) => item.kind === "calendar");
  assert.equal(calendar?.enabled, true);

  const applied = applyCustomerAgentConfiguration(original, {
    voiceProfile: "uk_clear",
    enabledActions: [],
    humanTransfer: "disabled",
  });
  assert.deepEqual(applied.permissions.allow, [
    "answer_information",
    "take_message",
  ]);
  assert.equal(
    applied.integrations.find((item) => item.kind === "calendar")?.enabled,
    false,
  );

  assert.throws(
    () =>
      applyCustomerAgentConfiguration(original, {
        voiceProfile: "uk_clear",
        enabledActions: ["appointments"],
        humanTransfer: "explicit_request",
      }),
    /Human transfer is not available/,
  );
});

test("customer configuration preserves connector references and never mutates privacy", () => {
  const original = blueprint("booking_assistant");
  original.integrations = original.integrations.map((integration) => ({
    ...integration,
    connectorRef:
      integration.kind === "calendar" ? "calendar_review_ref" : "telephone_review_ref",
  }));

  const configuration: CustomerAgentConfiguration = {
    voiceProfile: "uk_calm",
    enabledActions: ["appointments"],
    humanTransfer: "disabled",
  };
  const applied = applyCustomerAgentConfiguration(original, configuration);

  assert.deepEqual(
    applied.integrations.map((item) => item.connectorRef),
    ["telephone_review_ref", "calendar_review_ref"],
  );
  assert.equal(applied.agent.voiceProfile, "uk_calm");
  assert.deepEqual(applied.privacy, original.privacy);
});

test("customer configuration rejects unknown voice preferences and non-draft lifecycle", () => {
  const original = blueprint("receptionist");
  assert.throws(
    () =>
      applyCustomerAgentConfiguration(original, {
        voiceProfile: "provider-secret-voice" as never,
        enabledActions: [],
        humanTransfer: "explicit_request",
      }),
    /Unsupported customer voice preference/,
  );

  const reviewed = {
    ...original,
    lifecycle: { stage: "reviewed" as const },
  };
  assert.throws(
    () =>
      applyCustomerAgentConfiguration(reviewed, {
        voiceProfile: "choose_later",
        enabledActions: [],
        humanTransfer: "explicit_request",
      }),
    /requires a draft AgentBlueprint/,
  );
});
