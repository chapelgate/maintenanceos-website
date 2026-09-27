import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentBlueprintDraft } from "./agent-selection.ts";
import {
  applyReviewedIdentityToAgentBlueprint,
  buildAgentReviewRecord,
  buildAgentReviewRequirements,
  identityDraftFromBlueprint,
  reviewFactHint,
} from "./agent-review.ts";

const CREATED_AT = "2026-09-27T16:30:00.000Z";

function blueprint(type: Parameters<typeof buildAgentBlueprintDraft>[0]["type"]) {
  return buildAgentBlueprintDraft({
    type,
    businessName: "Acme Plumbing",
    businessUrl: "https://acme.example/",
    facts: {
      website: "https://acme.example/",
      businessName: "Acme Plumbing",
      locations: ["Wirral"],
      contact: {
        phones: ["0151 555 0100"],
        emails: ["hello@acme.example"],
      },
      services: ["Boiler repair"],
      hours: "Mon-Fri 08:00-17:00",
      faqs: [{ question: "Do you cover Wirral?", answer: "Yes." }],
    },
    blueprintId: "abp_step6test0001",
    createdAt: CREATED_AT,
  });
}

test("review gate always requires role and generated-output confirmation", () => {
  const requirements = buildAgentReviewRequirements({
    blueprint: blueprint("sales_enquiry"),
  });
  assert.ok(requirements.some((item) => item.id === "control:role"));
  assert.ok(requirements.some((item) => item.id === "control:ai_output"));
});

test("only low-confidence discovered facts become confidence confirmations", () => {
  const requirements = buildAgentReviewRequirements({
    blueprint: blueprint("sales_enquiry"),
    factMeta: {
      businessName: { source: "jsonld", confidence: "high" },
      services: { source: "nav", confidence: "low" },
      hours: { source: "details", confidence: "medium" },
      website: { source: "fetched_url", confidence: "low" },
    },
  });
  assert.ok(requirements.some((item) => item.id === "fact:services"));
  assert.ok(requirements.some((item) => item.id === "fact:website"));
  assert.ok(!requirements.some((item) => item.id === "fact:businessName"));
  assert.ok(!requirements.some((item) => item.id === "fact:hours"));
  assert.match(
    requirements.find((item) => item.id === "fact:website")?.detail ?? "",
    /submitted website URL/,
  );
});

test("consequential permissions and human transfer require explicit confirmation", () => {
  const maintenance = buildAgentReviewRequirements({
    blueprint: blueprint("maintenance_desk"),
  });
  assert.ok(
    maintenance.some(
      (item) => item.id === "capability:create_maintenance_job",
    ),
  );
  assert.ok(
    maintenance.some((item) => item.id === "capability:transfer_call"),
  );
  assert.ok(maintenance.some((item) => item.id === "rule:human_transfer"));
  assert.ok(
    !maintenance.some((item) => item.id === "capability:answer_information"),
  );
  assert.ok(!maintenance.some((item) => item.id === "capability:take_message"));

  const sales = buildAgentReviewRequirements({
    blueprint: blueprint("sales_enquiry"),
  });
  assert.ok(!sales.some((item) => item.id === "rule:human_transfer"));
});

test("missing facts are visible and become a mandatory acknowledgement", () => {
  const requirements = buildAgentReviewRequirements({
    blueprint: blueprint("receptionist"),
    missing: ["hours", "faqs", "hours"],
  });
  const missing = requirements.find(
    (item) => item.id === "control:missing_data",
  );
  assert.ok(missing);
  assert.match(missing.detail, /hours, faqs/);
});

test("review record fails closed until every current requirement is confirmed", () => {
  const requirements = buildAgentReviewRequirements({
    blueprint: blueprint("maintenance_desk"),
    factMeta: {
      services: { source: "nav", confidence: "low" },
    },
    missing: ["faqs"],
  });
  const partial = buildAgentReviewRecord(requirements, [
    "control:role",
    "unknown:stale",
  ]);
  assert.equal(partial.complete, false);
  assert.ok(!partial.confirmedIds.includes("unknown:stale"));
  assert.ok(partial.missingIds.includes("control:ai_output"));
  assert.ok(partial.missingIds.includes("fact:services"));

  const complete = buildAgentReviewRecord(
    requirements,
    requirements.map((item) => item.id),
  );
  assert.equal(complete.complete, true);
  assert.deepEqual(complete.missingIds, []);
});

test("identity edits can change locations/contact but never control-plane fields", () => {
  const original = blueprint("maintenance_desk");
  const next = applyReviewedIdentityToAgentBlueprint(original, {
    locations: "Liverpool\nWirral\nLiverpool",
    phone: "0151 555 9999",
    email: "ops@acme.example",
  });
  assert.deepEqual(next.identity.locations, ["Liverpool", "Wirral"]);
  assert.deepEqual(next.identity.contact, {
    phone: "0151 555 9999",
    email: "ops@acme.example",
  });
  assert.deepEqual(next.permissions, original.permissions);
  assert.deepEqual(next.rules, original.rules);
  assert.deepEqual(next.integrations, original.integrations);
  assert.deepEqual(next.privacy, original.privacy);
  assert.deepEqual(next.agent, original.agent);
});

test("identity review can deliberately remove discovered optional identity facts", () => {
  const original = blueprint("receptionist");
  const next = applyReviewedIdentityToAgentBlueprint(original, {
    locations: "",
    phone: "",
    email: "",
  });
  assert.equal(next.identity.locations, undefined);
  assert.equal(next.identity.contact, undefined);
  assert.equal(next.identity.website, original.identity.website);
  assert.equal(next.identity.businessName, original.identity.businessName);
});

test("invalid reviewed contact email is rejected before configuration generation", () => {
  assert.throws(
    () =>
      applyReviewedIdentityToAgentBlueprint(blueprint("receptionist"), {
        locations: "Wirral",
        phone: "",
        email: "not-an-email",
      }),
    /invalid/i,
  );
});

test("review fact hint makes low confidence explicit without inventing provenance", () => {
  assert.equal(reviewFactHint(undefined, true), null);
  assert.equal(
    reviewFactHint({ source: "jsonld", confidence: "low" }, false),
    null,
  );
  assert.match(
    reviewFactHint({ source: "nav", confidence: "low" }, true) ?? "",
    /low confidence; explicit confirmation is required/i,
  );
  assert.match(
    reviewFactHint({ source: "jsonld", confidence: "high" }, true) ?? "",
    /high confidence/i,
  );
});

test("identity draft mirrors only the current blueprint identity", () => {
  assert.deepEqual(identityDraftFromBlueprint(blueprint("receptionist")), {
    locations: "Wirral",
    phone: "0151 555 0100",
    email: "hello@acme.example",
  });
});
