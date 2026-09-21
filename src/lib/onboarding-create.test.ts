import assert from "node:assert/strict";
import test from "node:test";
import {
  CREATE_JOURNEY_STEPS,
  buildCreateLeadMessage,
  createJourneyNextAction,
  createScanProgressTitle,
  emptyHoursOrServicesNote,
  hostnameBusinessHint,
  isCreateScanReady,
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

test("create journey steps name the next action without a live-phone claim", () => {
  assert.deepEqual(
    CREATE_JOURNEY_STEPS.map((item) => item.label),
    ["Website", "Check", "Review", "Pack"],
  );
  assert.equal(createJourneyNextAction(1), "Check this website");
  assert.equal(createJourneyNextAction(2, "checking"), "Checking…");
  assert.equal(createJourneyNextAction(2, "scanned"), "Review draft");
  assert.equal(createJourneyNextAction(3), "Preview knowledge pack");
  assert.equal(createJourneyNextAction(4), "Submit early access request");
  assert.equal(isCreateScanReady("scanning"), false);
  assert.equal(isCreateScanReady("queued"), true);
  assert.match(createScanProgressTitle("queued"), /review a blank draft/i);
  assert.match(createScanProgressTitle("scanned"), /review extracted fields/i);
  for (const item of CREATE_JOURNEY_STEPS) {
    assert.doesNotMatch(item.nextAction, /live (phone|number|call)/i);
  }
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

test("buildCreateLeadMessage includes receptionist pack when provided", () => {
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
  assert.match(message, /Receptionist knowledge pack JSON/);
  assert.match(message, /sandbox_knowledge_pack/);
  assert.match(message, /not a live customer phone line/);
  assert.match(message, /not a live customer phone number/);
});
