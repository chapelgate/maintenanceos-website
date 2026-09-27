import assert from "node:assert/strict";
import test from "node:test";
import {
  AGENT_TEMPLATES,
  buildAgentBlueprintDraft,
} from "./agent-selection.ts";
import { validateAgentBlueprintV1 } from "./agent-blueprint.ts";

const BASE = {
  businessName: "Acme Plumbing",
  businessUrl: "https://acme.example/",
  blueprintId: "abp_step4test0001",
  createdAt: "2026-09-27T14:40:00.000Z",
  facts: {
    website: "https://acme.example/",
    businessName: "Acme Plumbing",
    locations: ["Liverpool", "Wirral"],
    contact: {
      phones: ["+44 151 555 0100"],
      emails: ["hello@acme.example"],
    },
    services: ["Boiler repair", "Heating maintenance"],
    hours: "Mon-Fri 08:00-17:00",
    faqs: [{ question: "Do you cover Wirral?", answer: "Yes." }],
  },
} as const;

test("all six controlled templates build schema-valid AgentBlueprint v1 drafts", () => {
  assert.equal(AGENT_TEMPLATES.length, 6);
  assert.deepEqual(
    AGENT_TEMPLATES.map((item) => item.type),
    [
      "receptionist",
      "maintenance_desk",
      "booking_assistant",
      "customer_service",
      "sales_enquiry",
      "custom",
    ],
  );

  for (const template of AGENT_TEMPLATES) {
    const blueprint = buildAgentBlueprintDraft({
      ...BASE,
      type: template.type,
    });
    const result = validateAgentBlueprintV1(blueprint);
    assert.equal(result.ok, true, template.type);
    assert.equal(blueprint.agent.type, template.type);
    assert.equal(blueprint.lifecycle.stage, "draft");
    assert.equal(blueprint.knowledge.untrustedWebsiteContent, true);
    assert.equal(blueprint.integrations.length, 0);
    assert.equal(blueprint.privacy.recordCalls, false);
    assert.equal(blueprint.privacy.transcribeCalls, false);
    assert.equal(blueprint.privacy.retentionDays, 0);
  }
});

test("template permissions are explicit and non-overlapping", () => {
  for (const template of AGENT_TEMPLATES) {
    const blueprint = buildAgentBlueprintDraft({
      ...BASE,
      type: template.type,
    });
    const overlap = blueprint.permissions.allow.filter((item) =>
      blueprint.permissions.deny.includes(item),
    );
    assert.deepEqual(overlap, [], template.type);
    assert.equal(
      blueprint.permissions.allow.length + blueprint.permissions.deny.length,
      8,
      template.type,
    );
  }
});

test("maintenance and booking templates expose only their required capabilities", () => {
  const maintenance = buildAgentBlueprintDraft({
    ...BASE,
    type: "maintenance_desk",
  });
  assert.deepEqual(maintenance.permissions.allow, [
    "answer_information",
    "take_message",
    "create_maintenance_job",
    "transfer_call",
  ]);

  const booking = buildAgentBlueprintDraft({
    ...BASE,
    type: "booking_assistant",
  });
  assert.deepEqual(booking.permissions.allow, [
    "answer_information",
    "take_message",
    "check_calendar",
    "book_appointment",
  ]);
  assert.equal(booking.rules.humanTransfer, "disabled");
});

test("structured scanner facts flow into the blueprint without credentials or provider settings", () => {
  const blueprint = buildAgentBlueprintDraft({
    ...BASE,
    type: "receptionist",
  });
  assert.deepEqual(blueprint.identity.locations, ["Liverpool", "Wirral"]);
  assert.deepEqual(blueprint.identity.contact, {
    phone: "+44 151 555 0100",
    email: "hello@acme.example",
  });
  assert.deepEqual(blueprint.knowledge.services, [
    "Boiler repair",
    "Heating maintenance",
  ]);
  assert.equal(blueprint.knowledge.hours, "Mon-Fri 08:00-17:00");
  assert.deepEqual(blueprint.knowledge.faqs, [
    { question: "Do you cover Wirral?", answer: "Yes." },
  ]);

  const serialised = JSON.stringify(blueprint);
  assert.doesNotMatch(serialised, /api[_-]?key|password|credential|provider|twilio|gemini|ttnc/i);
});

test("selection refuses a non-HTTPS website instead of fabricating a canonical URL", () => {
  assert.throws(
    () =>
      buildAgentBlueprintDraft({
        ...BASE,
        facts: undefined,
        businessUrl: "http://acme.example/",
        type: "receptionist",
      }),
    /HTTPS business website is required/,
  );
});

test("selection refuses an empty business name", () => {
  assert.throws(
    () =>
      buildAgentBlueprintDraft({
        ...BASE,
        businessName: "   ",
        type: "custom",
      }),
    /Business name is required/,
  );
});
