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
  mapScanSiteKnowledge,
  normalisePublicUrl,
  unsafePublicUrlMessage,
  UNSAFE_WEBSITE_URL_MESSAGE,
  scanFieldReviewHint,
  describeScanCoverage,
  isZeroFetchPartial,
  requestOnboardingScan,
  SCAN_REJECTED_MESSAGE,
  SCAN_TIMEOUT_MESSAGE,
  SCAN_UNAVAILABLE_MESSAGE,
  scanAttemptDetail,
  ZERO_FETCH_PARTIAL_MESSAGE,
} from "./onboarding-create.ts";

test("normalisePublicUrl accepts public https and rejects junk", () => {
  assert.equal(normalisePublicUrl("example.co.uk"), "https://example.co.uk/");
  assert.equal(
    normalisePublicUrl("https://trades.example.com/contact"),
    "https://trades.example.com/contact",
  );
  assert.equal(normalisePublicUrl("https://172.15.0.1/"), "https://172.15.0.1/");
  assert.equal(normalisePublicUrl("https://172.32.0.1/"), "https://172.32.0.1/");
  assert.equal(normalisePublicUrl("localhost"), null);
  assert.equal(normalisePublicUrl("not a url"), null);
  assert.equal(normalisePublicUrl(""), null);
});

test("unsafe website URLs are refused before a public https URL is accepted", () => {
  const refused = [
    "http://example.com",
    "http://example.com/contact",
    "https://10.1.2.3/",
    "http://10.0.0.1",
    "https://192.168.1.20/admin",
    "https://172.16.0.1/",
    "https://172.31.255.255/",
    "https://127.0.0.1/",
    "http://127.1.2.3",
    "localhost",
    "http://localhost",
    "https://localhost/create",
  ];
  for (const value of refused) {
    assert.equal(normalisePublicUrl(value), null, value);
    assert.equal(unsafePublicUrlMessage(value), UNSAFE_WEBSITE_URL_MESSAGE, value);
  }
  assert.equal(unsafePublicUrlMessage("https://example.com"), null);
  assert.equal(unsafePublicUrlMessage("not a url"), null);
  assert.match(UNSAFE_WEBSITE_URL_MESSAGE, /https:\/\//);
  assert.match(UNSAFE_WEBSITE_URL_MESSAGE, /localhost/);
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

test("mapScanSiteKnowledge allow-lists bounded HTTPS evidence only", () => {
  const mapped = mapScanSiteKnowledge({
    knowledge: [
      {
        url: "https://acme.example/deep",
        title: "Deep details",
        headingPath: ["Service", "Eligibility"],
        text: "The supported scheme is available to housing associations.",
        contentHash: "hash-1",
        secret: "drop-me",
      },
      {
        url: "http://acme.example/insecure",
        headingPath: [],
        text: "Must be rejected.",
        contentHash: "hash-2",
      },
      {
        url: "https://acme.example/no-hash",
        headingPath: [],
        text: "Must be rejected.",
      },
    ],
  });
  assert.deepEqual(mapped, [{
    url: "https://acme.example/deep",
    title: "Deep details",
    headingPath: ["Service", "Eligibility"],
    text: "The supported scheme is available to housing associations.",
    contentHash: "hash-1",
  }]);
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
  assert.match(createScanProgressTitle("scanned"), /review supplied fields/i);

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

test("zero-fetch PARTIAL is a failed read, not an empty draft", () => {
  const alleygatesStyle = {
    ok: true,
    draft: {},
    warnings: ["scanner_v2_partial"],
    scannerV2: {
      state: "PARTIAL",
      discovered: 1,
      fetched: 0,
      unresolved: 0,
      knowledgeChunks: 0,
      resumed: true,
    },
  };
  assert.equal(isZeroFetchPartial(alleygatesStyle), true);
  assert.equal(
    isZeroFetchPartial({
      ok: true,
      scannerV2: { state: "COMPLETE", fetched: 1, resumed: false },
    }),
    false,
  );
  assert.equal(
    isZeroFetchPartial({
      ok: true,
      scannerV2: { state: "PARTIAL", fetched: 2 },
    }),
    false,
  );
  assert.equal(isZeroFetchPartial({ ok: true, draft: {} }), false);
  assert.doesNotMatch(ZERO_FETCH_PARTIAL_MESSAGE, /nothing found/i);
  assert.doesNotMatch(ZERO_FETCH_PARTIAL_MESSAGE, /No draft fields were supplied/);
  assert.match(ZERO_FETCH_PARTIAL_MESSAGE, /could not read any public pages/);
  assert.match(ZERO_FETCH_PARTIAL_MESSAGE, /Nothing was invented/);
  assert.equal(
    describeScanCoverage({
      summary: {
        state: "PARTIAL",
        discovered: 1,
        fetched: 0,
        unresolved: 0,
        warnings: ["http_401", "scanner_v2_partial"],
      },
      draft: {},
    }),
    null,
  );
});

test("PARTIAL with evidence names what was found and what is still blank", () => {
  const coverage = describeScanCoverage({
    summary: {
      state: "PARTIAL",
      discovered: 4,
      fetched: 2,
      unresolved: 1,
      warnings: ["http_401", "scanner_v2_partial"],
    },
    draft: {
      businessName: "Alley Gates",
      greeting: "",
      hours: "",
      services: "Alley gate installation",
      faqs: "",
    },
  });
  assert.ok(coverage);
  if (!coverage) return;
  assert.deepEqual(coverage.found, ["business name", "services"]);
  assert.deepEqual(coverage.missing, ["greeting", "opening hours", "questions and answers"]);
  assert.match(coverage.detail, /Read 2 of 4 discovered public pages/);
  assert.match(coverage.detail, /1 stayed unresolved/);
  assert.match(coverage.detail, /Some pages were refused/);
  assert.match(coverage.detail, /fill the gaps yourself/);
  assert.match(coverage.detail, /Nothing was invented/);
  assert.doesNotMatch(coverage.detail, /nothing found/i);
  assert.doesNotMatch(coverage.detail, /No draft fields were supplied/);
  assert.equal(
    describeScanCoverage({
      summary: { state: "COMPLETE", discovered: 1, fetched: 1, unresolved: 0, warnings: [] },
      draft: { businessName: "Example" },
    }),
    null,
  );
});

const SUCCESS_SCAN = {
  ok: true,
  draft: { businessName: "Example Domain" },
  facts: {
    businessName: "Example Domain",
    website: "https://example.com/",
  },
  factMeta: {
    website: { confidence: "high", source: "fetched_url" },
  },
  knowledge: [
    {
      url: "https://example.com/",
      title: "Example Domain",
      headingPath: [],
      text: "This domain is for use in documentation examples.",
      contentHash: "abc123",
    },
  ],
  scannerV2: {
    state: "COMPLETE",
    discovered: 1,
    fetched: 1,
    unresolved: 0,
    knowledgeChunks: 1,
    resumed: false,
  },
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("scan attempt copy names the try and the manual way forward", () => {
  assert.match(scanAttemptDetail({ attempt: 1, maxAttempts: 2, phase: "request" }), /attempt 1 of 2/i);
  assert.match(scanAttemptDetail({ attempt: 1, maxAttempts: 2, phase: "retry" }), /attempt 2 of 2/i);
  assert.match(scanAttemptDetail({ attempt: 1, maxAttempts: 2, phase: "request" }), /continue/i);
  assert.match(createScanProgressTitle("queued"), /—/);
  assert.doesNotMatch(createScanProgressTitle("queued"), /\?/);
});

test("mocked scanner success maps facts and does not invent empty fields", async () => {
  const calls = [];
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    fetchImpl: async (input, init) => {
      calls.push({ input: String(input), body: JSON.parse(String(init?.body)) });
      return jsonResponse(200, SUCCESS_SCAN);
    },
  });
  assert.equal(outcome.status, "ok");
  if (outcome.status !== "ok") return;
  assert.equal(outcome.draft.businessName, "Example Domain");
  assert.equal(outcome.draft.hours, undefined);
  assert.equal(outcome.facts.website, "https://example.com/");
  assert.deepEqual(outcome.summary, {
    state: "COMPLETE",
    discovered: 1,
    fetched: 1,
    unresolved: 0,
    warnings: [],
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].body, { url: "https://example.com/" });
  assert.doesNotMatch(JSON.stringify(outcome), /api[_-]?key|secret|token/i);
});

test("mocked scanner zero-fetch stays a failed read and can be completed manually", async () => {
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    fetchImpl: async () =>
      jsonResponse(200, {
        ok: true,
        draft: {},
        warnings: ["scanner_v2_partial"],
        scannerV2: { state: "PARTIAL", discovered: 1, fetched: 0, unresolved: 0 },
      }),
  });
  assert.equal(outcome.status, "manual");
  if (outcome.status !== "manual") return;
  assert.equal(outcome.reason, "zero_fetch");
  assert.equal(outcome.message, ZERO_FETCH_PARTIAL_MESSAGE);
  assert.match(outcome.message, /complete the draft yourself/i);
  assert.doesNotMatch(outcome.message, /nothing found/i);
});

test("mocked scanner timeout retries once then offers the manual draft", async () => {
  let calls = 0;
  const progress = [];
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    timeoutMs: 15,
    backoffMs: 0,
    sleep: async () => {},
    onProgress: (event) => progress.push(event.phase),
    fetchImpl: (_input, init) =>
      new Promise((_resolve, reject) => {
        calls += 1;
        const signal = init?.signal;
        const fail = () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        if (signal?.aborted) fail();
        else signal?.addEventListener("abort", fail, { once: true });
      }),
  });
  assert.equal(calls, 2);
  assert.deepEqual(progress, ["request", "retry", "request"]);
  assert.equal(outcome.status, "manual");
  if (outcome.status !== "manual") return;
  assert.equal(outcome.reason, "timeout");
  assert.equal(outcome.message, SCAN_TIMEOUT_MESSAGE);
});

test("mocked scanner 5xx retries once and keeps a successful second response", async () => {
  let calls = 0;
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    backoffMs: 0,
    sleep: async () => {},
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return jsonResponse(502, { ok: false, error: "upstream_unavailable" });
      return jsonResponse(200, SUCCESS_SCAN);
    },
  });
  assert.equal(calls, 2);
  assert.equal(outcome.status, "ok");
});

test("mocked scanner 5xx on every attempt ends in a manual draft", async () => {
  let calls = 0;
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    backoffMs: 0,
    sleep: async () => {},
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse(500, { ok: false, error: "internal_error" });
    },
  });
  assert.equal(calls, 2);
  assert.equal(outcome.status, "manual");
  if (outcome.status !== "manual") return;
  assert.equal(outcome.reason, "unavailable");
  assert.equal(outcome.message, SCAN_UNAVAILABLE_MESSAGE);
});

test("mocked scanner 400 is not retried and still lets the visitor continue", async () => {
  let calls = 0;
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse(400, { ok: false, error: "invalid_url" });
    },
  });
  assert.equal(calls, 1);
  assert.equal(outcome.status, "manual");
  if (outcome.status !== "manual") return;
  assert.equal(outcome.reason, "rejected");
  assert.equal(outcome.message, SCAN_REJECTED_MESSAGE);
});

test("an aborted scan does not become a failed draft", async () => {
  const controller = new AbortController();
  controller.abort();
  const outcome = await requestOnboardingScan("/api/website/scan", "https://example.com/", {
    signal: controller.signal,
    fetchImpl: async () => {
      throw new Error("should not fetch");
    },
  });
  assert.equal(outcome.status, "aborted");
});
