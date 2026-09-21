import assert from "node:assert/strict";
import test from "node:test";
import {
  mapSessionResponse,
  mapTestResponse,
  requestSandboxSession,
  requestSandboxTest,
  resetBrowserSandboxMock,
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

test("runBrowserScriptedDemo does not invent missing draft answers", () => {
  const turns = runBrowserScriptedDemo({
    businessName: "",
    greeting: "",
    hours: "",
    services: "",
    faqs: "",
  });
  assert.ok(turns.some((turn) => /do not have opening hours/i.test(turn.text)));
  assert.ok(turns.some((turn) => /not a live phone call/i.test(turn.text)));
});
