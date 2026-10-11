import assert from "node:assert/strict";
import test from "node:test";
import {
  mapSessionResponse,
  mapTestResponse,
  requestSandboxScriptedDemo,
  requestSandboxSession,
  requestSandboxTest,
  resetBrowserSandboxMock,
  runBrowserInteractiveReply,
  runBrowserScriptedDemo,
} from "./sandbox-test-call.ts";

test("mapSessionResponse never invents an id or a live number", () => {
  assert.equal(mapSessionResponse(null), null);
  assert.equal(mapSessionResponse({ ok: true }), null);
  assert.equal(
    mapSessionResponse({
      ok: true,
      data: { id: "sess_1", liveCall: true, liveNumber: "+44111" },
    }),
    null,
  );
  const mapped = mapSessionResponse({
    ok: true,
    data: {
      id: "sandbox_sess_1",
      kind: "sandbox",
      status: "ready",
      draft: { businessName: "Acme" },
      createdAt: "2026-09-20T12:00:00.000Z",
      liveCall: false,
      liveNumber: null,
    },
  });
  assert.ok(mapped);
  assert.equal(mapped.id, "sandbox_sess_1");
  assert.equal(mapped.kind, "sandbox");
  assert.equal(mapped.status, "ready");
  assert.deepEqual(mapped.draft, {
    businessName: "Acme",
    greeting: "",
    hours: "",
    services: "",
    faqs: "",
  });
  assert.equal(mapped.createdAt, "2026-09-20T12:00:00.000Z");
  assert.equal(mapped.liveCall, false);
  assert.equal(mapped.liveNumber, null);
  assert.equal(mapped.knowledgePack?.businessName, "Acme");
  assert.equal(mapped.knowledgePack?.liveCall, false);
  assert.ok(mapped.knowledgePack?.missing.includes("hours"));
  assert.match(mapped.systemPrompt ?? "", /not a live customer phone line/i);
});

test("mapTestResponse rejects live-call payloads and missing ids", () => {
  assert.equal(mapTestResponse({ ok: true, data: { id: "t1" } }), null);
  assert.equal(
    mapTestResponse({
      ok: true,
      data: {
        id: "t1",
        sessionId: "s1",
        status: "scripted_demo_complete",
        liveCall: true,
      },
    }),
    null,
  );
});

test("requestSandboxSession is disabled when the public flag is off", async () => {
  const result = await requestSandboxSession({
    enabled: false,
    endpoint: "http://127.0.0.1:8790/v1/sandbox",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
  });
  assert.equal(result.status, "disabled");
});

test("in-browser mock creates a session and runs a scripted demo", async () => {
  resetBrowserSandboxMock();
  const session = await requestSandboxSession({
    enabled: true,
    endpoint: "",
    draft: {
      businessName: "Acme Plumbing",
      greeting: "Warm homes",
      hours: "9-5",
      services: "Boilers",
      faqs: "Q: London?\nA: Yes.",
    },
  });
  assert.equal(session.status, "ok");
  if (session.status !== "ok") return;
  assert.match(session.data.id, /^browser_sandbox_/);
  assert.equal(session.data.liveNumber, null);
  assert.equal(session.data.liveCall, false);
  assert.equal(session.data.knowledgePack?.hours, "9-5");
  assert.match(session.data.systemPrompt ?? "", /not a live customer phone line/i);

  const tested = await requestSandboxTest({
    enabled: true,
    endpoint: "",
    sessionId: session.data.id,
    mode: "scripted",
  });
  assert.equal(tested.status, "ok");
  if (tested.status !== "ok") return;
  assert.equal(tested.data.status, "scripted_demo_complete");
  assert.equal(tested.data.liveCall, false);
  assert.ok(tested.data.turns.some((turn) => turn.text.includes("Warm homes")));
  assert.ok(tested.data.turns.some((turn) => /Acme Plumbing/.test(turn.text) && /9-5/.test(turn.text)));
  assert.ok(tested.data.turns.some((turn) => /Boilers/.test(turn.text)));
});

test("requestSandboxScriptedDemo is one pack-aware click and stays off by default", async () => {
  resetBrowserSandboxMock();
  const disabled = await requestSandboxScriptedDemo({
    enabled: false,
    endpoint: "",
    draft: {
      businessName: "Acme Plumbing",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
  });
  assert.equal(disabled.status, "disabled");

  const demo = await requestSandboxScriptedDemo({
    enabled: true,
    endpoint: "",
    draft: {
      businessName: "Acme Plumbing",
      greeting: "",
      hours: "",
      services: "Boilers",
      faqs: "",
    },
  });
  assert.equal(demo.status, "ok");
  if (demo.status !== "ok") return;
  assert.equal(demo.data.session.liveCall, false);
  assert.equal(demo.data.session.liveNumber, null);
  assert.equal(demo.data.test.status, "scripted_demo_complete");
  assert.equal(demo.data.test.liveCall, false);
  assert.ok(demo.data.test.turns.some((turn) => /Boilers/.test(turn.text)));
  assert.ok(
    demo.data.test.turns.some(
      (turn) => /opening hours/i.test(turn.text) && /not on file/i.test(turn.text),
    ),
  );
});

test("in-browser scripted demo uses overlay pack and does not invent missing hours", async () => {
  resetBrowserSandboxMock();
  const session = await requestSandboxSession({
    enabled: true,
    endpoint: "",
    draft: {
      businessName: "Draft Name Ltd",
      greeting: "",
      hours: "Mon–Fri 08:00–17:00",
      services: "Draft-only service",
      faqs: "",
    },
    knowledgePack: {
      untrusted: true,
      kind: "sandbox_knowledge_pack",
      liveCall: false,
      liveNumber: null,
      alwaysOn: false,
      productionTelephony: false,
      businessName: "Reviewed Plumbing",
      missing: ["greeting", "hours", "services", "faqs"],
    },
  });
  assert.equal(session.status, "ok");
  if (session.status !== "ok") return;
  assert.equal(session.data.knowledgePack?.businessName, "Reviewed Plumbing");
  assert.equal(session.data.knowledgePack?.hours, undefined);

  const tested = await requestSandboxTest({
    enabled: true,
    endpoint: "",
    sessionId: session.data.id,
    mode: "scripted",
  });
  assert.equal(tested.status, "ok");
  if (tested.status !== "ok") return;
  const text = tested.data.turns.map((turn) => turn.text).join("\n");
  assert.match(text, /Reviewed Plumbing/);
  assert.match(text, /not sure/i);
  assert.match(text, /not on file/i);
  assert.doesNotMatch(text, /Mon–Fri 08:00–17:00/);
  assert.doesNotMatch(text, /Draft-only service/);
  assert.doesNotMatch(text, /Draft Name Ltd/);
});

test("in-browser webrtc / live modes never invent a live call", async () => {
  resetBrowserSandboxMock();
  const session = await requestSandboxSession({
    enabled: true,
    endpoint: "",
    draft: {
      businessName: "Acme",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
  });
  assert.equal(session.status, "ok");
  if (session.status !== "ok") return;

  const webrtc = await requestSandboxTest({
    enabled: true,
    endpoint: "",
    sessionId: session.data.id,
    mode: "webrtc",
  });
  assert.equal(webrtc.status, "error");
  if (webrtc.status === "error") {
    assert.equal(webrtc.code, "not_configured");
    assert.match(webrtc.message, /will not invent a live phone call/);
  }

  const live = await requestSandboxTest({
    enabled: true,
    endpoint: "",
    sessionId: session.data.id,
    mode: "live",
  });
  assert.equal(live.status, "error");
  if (live.status === "error") {
    assert.equal(live.code, "live_call_forbidden");
  }
});

test("runBrowserScriptedDemo does not invent missing pack answers", () => {
  const turns = runBrowserScriptedDemo({
    businessName: "Acme Plumbing",
  });
  assert.ok(turns.some((turn) => /Acme Plumbing/.test(turn.text)));
  assert.ok(turns.some((turn) => /not sure/i.test(turn.text) && /opening hours/i.test(turn.text) && /not on file/i.test(turn.text)));
  assert.ok(turns.some((turn) => /not a live phone call/i.test(turn.text)));
});

test("public browser replies are pack-aware and hide engineering terminology", () => {
  const pack = {
    untrusted: true,
    kind: "sandbox_knowledge_pack" as const,
    liveCall: false as const,
    liveNumber: null,
    alwaysOn: false as const,
    productionTelephony: false as const,
    businessName: "Express Gas Delivery",
    services: ["Propane Gas Cylinders", "Patio Gas"],
    missing: ["greeting", "hours", "faqs"] as const,
  };

  const services = runBrowserInteractiveReply(
    "What do you do?",
    pack,
  );
  assert.equal(services.source, "knowledge.services");
  assert.match(services.text, /Propane Gas Cylinders/);
  assert.doesNotMatch(services.text, /scripted sandbox|frozen production telephony/i);

  const human = runBrowserInteractiveReply(
    "I want to speak to a human.",
    pack,
  );
  assert.match(human.text, /can't transfer this browser preview/i);
  assert.doesNotMatch(
    human.text,
    /scripted sandbox|frozen production telephony|knowledge pack/i,
  );

  const missing = runBrowserInteractiveReply(
    "What are your opening hours?",
    pack,
  );
  assert.match(missing.text, /opening hours/i);
  assert.doesNotMatch(
    missing.text,
    /scripted sandbox|frozen production telephony|knowledge pack/i,
  );
});

test("browser reply uses source-grounded deep-site evidence", () => {
  const pack = {
    untrusted: true,
    kind: "sandbox_knowledge_pack" as const,
    liveCall: false as const,
    liveNumber: null,
    alwaysOn: false as const,
    productionTelephony: false as const,
    businessName: "Alley Gates",
    missing: ["greeting", "hours", "services", "faqs"] as const,
  };
  const siteKnowledge = [{
    url: "https://alleygates.co.uk/installation/deep/",
    title: "Heritage alley gate installation",
    headingPath: ["Installation lead time"],
    text: "Heritage alley gate installation normally takes six weeks after the confirmed survey.",
    contentHash: "abc123",
  }];

  const reply = runBrowserInteractiveReply(
    "How long does a heritage alley gate installation take?",
    pack,
    undefined,
    siteKnowledge,
  );
  assert.equal(reply.source, "knowledge.site");
  assert.match(reply.text, /six weeks/i);

  const unrelated = runBrowserInteractiveReply(
    "Do you repair spacecraft engines on Mars?",
    pack,
    undefined,
    siteKnowledge,
  );
  assert.equal(unrelated.source, "missing");
  assert.doesNotMatch(unrelated.text, /six weeks/i);
});

test("runBrowserScriptedDemo with pack name+hours mentions both", () => {
  const turns = runBrowserScriptedDemo({
    businessName: "Acme Plumbing",
    hours: "Mon–Fri 08:00–17:00",
  });
  const hoursTurn = turns.find((turn) => turn.source === "knowledge.hours");
  assert.ok(hoursTurn);
  assert.match(hoursTurn.text, /Acme Plumbing/);
  assert.match(hoursTurn.text, /Mon–Fri 08:00–17:00/);
});

test("runBrowserInteractiveReply answers locations and contact and announces preview when missing", () => {
  const pack = {
    untrusted: true,
    kind: "sandbox_knowledge_pack" as const,
    liveCall: false as const,
    liveNumber: null,
    alwaysOn: false as const,
    productionTelephony: false as const,
    businessName: "Acme Heating",
    locations: ["Leeds", "Bradford"],
    contact: { phone: "0113 987 6543", email: "support@acme.example" },
    missing: ["greeting", "hours", "services", "faqs"] as const,
  };

  const locReply = runBrowserInteractiveReply(
    "Where are you based?",
    pack,
  );
  assert.equal(locReply.source, "knowledge.locations");
  assert.match(locReply.text, /Leeds/);
  assert.match(locReply.text, /Bradford/);

  const contactReply = runBrowserInteractiveReply(
    "What is your phone number?",
    pack,
  );
  assert.equal(contactReply.source, "knowledge.contact");
  assert.match(contactReply.text, /0113 987 6543/);

  const missingReply = runBrowserInteractiveReply(
    "What are your opening hours?",
    pack,
  );
  assert.equal(missingReply.source, "missing");
  assert.match(
    missingReply.text,
    /This is a preview and that detail has not been added yet\./,
  );
});

