import assert from "node:assert/strict";
import test from "node:test";
import {
  CREATE_JOURNEY_STEPS,
  buildCreateLeadMessage,
  createJourneyNextAction,
  createJourneyStepAnnouncement,
  createJourneyStepStatus,
  createJourneyStepStatusLabel,
  createScanProgressTitle,
  emptyHoursOrServicesNote,
  hostnameBusinessHint,
  isCreateScanReady,
  mapScanBusinessFactMeta,
  mapScanBusinessFacts,
  mapScanFieldMeta,
  mapScanResponse,
  normalisePublicUrl,
  scanFieldReviewHint,
} from "./onboarding-create.ts";

test("normalisePublicUrl accepts public http(s) and rejects junk", () => {
  assert.equal(normalisePublicUrl("example.co.uk"), "https://example.co.uk/");
  assert.equal(
    normalisePublicUrl("https://trades.example.com/contact"),
    "https://trades.example.com/contact",
  );
  assert.equal(normalisePublicUrl("localhost"), null);
  assert.equal(normalisePublicUrl("not a url"), null);
  assert.equal(normalisePublicUrl(""), null);
});

test("hostnameBusinessHint uses the first label only", () => {
  assert.equal(
    hostnameBusinessHint("https://www.acme-plumbing.co.uk/"),
    "acme plumbing",
  );
  assert.equal(hostnameBusinessHint("https://example.com"), "example");
});

test("mapScanResponse never invents fields", () => {
  assert.deepEqual(mapScanResponse(null), {});
  assert.deepEqual(mapScanResponse({ ok: true }), {});
  assert.deepEqual(mapScanResponse({ businessName: 12, greeting: "" }), {});
  assert.deepEqual(
    mapScanResponse({
      businessName: "Acme",
      extra: "ignore me",
      faqs: "  Do you cover London?  ",
    }),
    { businessName: "Acme", faqs: "Do you cover London?" },
  );
  assert.deepEqual(
    mapScanResponse({
      draft: { hours: "Mon–Fri 08:00–17:00", services: "Boilers" },
    }),
    { hours: "Mon–Fri 08:00–17:00", services: "Boilers" },
  );
});

test("mapScanFieldMeta copies only known provenance and ignores junk", () => {
  assert.deepEqual(mapScanFieldMeta(null), {});
  assert.deepEqual(mapScanFieldMeta({ draft: { businessName: "Acme" } }), {});
  assert.deepEqual(
    mapScanFieldMeta({
      fieldMeta: {
        hours: { source: "jsonld", confidence: "high" },
        services: { source: "nav", confidence: "low" },
        greeting: { source: "invented", confidence: "high" },
        faqs: { source: "details", confidence: "maybe" },
      },
    }),
    {
      hours: { source: "jsonld", confidence: "high" },
      services: { source: "nav", confidence: "low" },
    },
  );
});


test("mapScanBusinessFacts allow-lists structured intake and rejects malformed values", () => {
  assert.deepEqual(mapScanBusinessFacts(null), {});
  assert.deepEqual(
    mapScanBusinessFacts({
      facts: {
        website: "https://acme.example/",
        businessName: " Acme Plumbing ",
        locations: [" Liverpool ", "Liverpool"],
        contact: {
          phones: ["+44 151 555 0100", "0151 555 0100", "Call 0151 555 0100"],
          emails: ["hello@acme.example", "not-an-email"],
          api_key: "must-not-map",
        },
        services: ["Boiler repair", "Boiler repair"],
        hours: " Mon-Fri 08:00-17:00 ",
        faqs: [
          { question: "Do you cover Wirral?", answer: "Yes." },
          { question: "", answer: "drop" },
        ],
        unexpected: "ignore",
      },
    }),
    {
      website: "https://acme.example/",
      businessName: "Acme Plumbing",
      locations: ["Liverpool"],
      contact: {
        phones: ["+44 151 555 0100"],
        emails: ["hello@acme.example"],
      },
      services: ["Boiler repair"],
      hours: "Mon-Fri 08:00-17:00",
      faqs: [{ question: "Do you cover Wirral?", answer: "Yes." }],
    },
  );

  assert.deepEqual(
    mapScanBusinessFacts({
      facts: { website: "http://acme.example/", contact: { emails: ["bad"] } },
    }),
    {},
  );
});

test("mapScanBusinessFactMeta keeps provenance only for surviving facts", () => {
  const body = {
    facts: {
      website: "https://acme.example/",
      businessName: "Acme",
      locations: ["Liverpool"],
    },
    factMeta: {
      website: { source: "fetched_url", confidence: "high" },
      businessName: { source: "jsonld", confidence: "high" },
      locations: { source: "microdata", confidence: "medium" },
      contact: { source: "contact_link", confidence: "high" },
      services: { source: "invented", confidence: "high" },
    },
  };
  const facts = mapScanBusinessFacts(body);
  assert.deepEqual(mapScanBusinessFactMeta(body, facts), {
    website: { source: "fetched_url", confidence: "high" },
    businessName: { source: "jsonld", confidence: "high" },
    locations: { source: "microdata", confidence: "medium" },
  });
});

test("create journey steps name the next action without a live-phone claim", () => {
  assert.deepEqual(
    CREATE_JOURNEY_STEPS.map((item) => item.label),
    ["Website", "Check", "Choose", "Configure", "Review & Try"],
  );
  assert.equal(createJourneyNextAction(1), "Check this website");
  assert.equal(createJourneyNextAction(2, "checking"), "Checking…");
  assert.equal(createJourneyNextAction(2, "scanned"), "Choose agent");
  assert.equal(createJourneyNextAction(3), "Configure agent");
  assert.equal(createJourneyNextAction(4), "Generate reviewed configuration");
  assert.equal(createJourneyNextAction(5), "Try your receptionist");
  assert.equal(isCreateScanReady("scanning"), false);
  assert.equal(isCreateScanReady("queued"), true);
  assert.match(createScanProgressTitle("queued"), /review the draft/i);
  assert.match(createScanProgressTitle("scanned"), /review extracted fields/i);
  for (const item of CREATE_JOURNEY_STEPS) {
    assert.doesNotMatch(item.nextAction, /live (phone|number|call)/i);
  }
});

test("create journey stepper names current/completed without a live-phone claim", () => {
  assert.equal(createJourneyStepStatus(1, 1), "current");
  assert.equal(createJourneyStepStatus(1, 3), "completed");
  assert.equal(createJourneyStepStatus(5, 2), "upcoming");
  assert.equal(createJourneyStepStatusLabel("current"), "Current step");
  assert.equal(createJourneyStepStatusLabel("completed"), "Completed");
  assert.equal(createJourneyStepStatusLabel("upcoming"), "Not started");
  assert.equal(createJourneyStepAnnouncement(1), "Step 1 of 5: Website");
  assert.equal(createJourneyStepAnnouncement(3), "Step 3 of 5: Choose");
  assert.equal(createJourneyStepAnnouncement(4), "Step 4 of 5: Configure");
  assert.doesNotMatch(createJourneyStepAnnouncement(5), /live (phone|number|call)/i);
});

test("emptyHoursOrServicesNote stays empty and never uses sample copy", () => {
  assert.equal(emptyHoursOrServicesNote("hours", "Mon–Fri 08:00–17:00"), null);
  assert.equal(emptyHoursOrServicesNote("services", "Boilers"), null);
  assert.match(emptyHoursOrServicesNote("hours", "") ?? "", /Empty — not on file/);
  assert.match(emptyHoursOrServicesNote("services", "   ") ?? "", /Empty — not on file/);
  assert.match(emptyHoursOrServicesNote("hours", undefined) ?? "", /not invented/);
  assert.doesNotMatch(emptyHoursOrServicesNote("hours", "") ?? "", /Mon–Fri|09:00|example/i);
  assert.doesNotMatch(emptyHoursOrServicesNote("services", "") ?? "", /boiler|example/i);
});

test("scanFieldReviewHint is honest about missing provenance and empty fields", () => {
  assert.equal(scanFieldReviewHint(undefined, "Acme"), null);
  assert.equal(
    scanFieldReviewHint({ source: "jsonld", confidence: "high" }, ""),
    null,
  );
  assert.equal(
    scanFieldReviewHint({ source: "jsonld", confidence: "high" }, "   "),
    null,
  );
  assert.equal(
    scanFieldReviewHint({ source: "invented", confidence: "high" }, "Acme"),
    null,
  );
  assert.match(
    scanFieldReviewHint({ source: "jsonld", confidence: "high" }, "Acme") ?? "",
    /JSON-LD \(high confidence\)/,
  );
  assert.match(
    scanFieldReviewHint({ source: "nav", confidence: "low" }, "Boilers") ?? "",
    /navigation links \(low confidence — check this\)/,
  );
  assert.doesNotMatch(
    scanFieldReviewHint({ source: "nav", confidence: "low" }, "Boilers") ?? "",
    /invent/i,
  );
});

test("buildCreateLeadMessage includes URL and draft JSON", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "not_configured_queued",
    draft: {
      businessName: "example",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
  });
  assert.match(message, /Business URL: https:\/\/example.com\//);
  assert.match(message, /not_configured_queued/);
  assert.match(message, /"businessName": "example"/);
});

test("buildCreateLeadMessage includes field meta when provided", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "scan_response_mapped",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "Mo-Fr 08:00-17:00",
      services: "",
      faqs: "",
    },
    fieldMeta: { hours: { source: "jsonld", confidence: "high" } },
  });
  assert.match(message, /Field meta JSON/);
  assert.match(message, /"source": "jsonld"/);
});

test("buildCreateLeadMessage includes fact provenance and customer review evidence", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "scan_response_mapped",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
    factMeta: {
      services: { source: "nav", confidence: "low" },
    },
    review: {
      version: "1.0.0",
      revisionId: "arv1_12345678",
      complete: true,
      requiredIds: ["control:role", "fact:services"],
      confirmedIds: ["control:role", "fact:services"],
      missingIds: [],
    },
  });
  assert.match(message, /Fact meta JSON/);
  assert.match(message, /"confidence": "low"/);
  assert.match(message, /Customer review JSON/);
  assert.match(message, /"revisionId": "arv1_12345678"/);
  assert.match(message, /"complete": true/);
  assert.match(message, /"fact:services"/);
});

test("buildCreateLeadMessage includes the selected AgentBlueprint when provided", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "scan_response_mapped",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
    agentBlueprint: {
      schemaVersion: "1.0.0",
      blueprintId: "abp_test0001",
      agent: { type: "maintenance_desk" },
      lifecycle: { stage: "draft" },
    },
  });
  assert.match(message, /Agent blueprint JSON/);
  assert.match(message, /"type": "maintenance_desk"/);
  assert.match(message, /"stage": "draft"/);
});

test("buildCreateLeadMessage includes agent pack when provided", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "scan_response_mapped",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
    receptionist: {
      knowledgePack: {
        untrusted: true,
        kind: "sandbox_knowledge_pack",
        liveCall: false,
        liveNumber: null,
        alwaysOn: false,
        productionTelephony: false,
        businessName: "Acme",
        missing: ["greeting", "hours", "services", "faqs"],
      },
      systemPrompt: "not a live customer phone line",
      limitations: ["Pre-launch sandbox draft only — not a live customer phone number."],
    },
  });
  assert.match(message, /Agent knowledge pack JSON/);
  assert.match(message, /sandbox_knowledge_pack/);
  assert.match(message, /not a live customer phone line/);
  assert.match(message, /not a live customer phone number/);
});


test("buildCreateLeadMessage includes sandbox qualification evidence", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "scan_response_mapped",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
    sandboxQualification: {
      version: "agent_sandbox_qualification_v1",
      reviewRevisionId: "arv1_12345678",
      source: "companion",
      sessionId: "sandbox_sess_1",
      testId: "sandbox_test_1",
      complete: true,
      checks: [{ id: "companion_boundary", ok: true }],
      failedCheckIds: [],
    },
  });
  assert.match(message, /Sandbox qualification JSON/);
  assert.match(message, /agent_sandbox_qualification_v1/);
  assert.match(message, /"source": "companion"/);
  assert.match(message, /"reviewRevisionId": "arv1_12345678"/);
  assert.match(message, /"complete": true/);
});
