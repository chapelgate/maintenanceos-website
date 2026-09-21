import assert from "node:assert/strict";
import test from "node:test";
import { createSandboxEngine, resolveTestMode } from "./engine.ts";
import { normalizeDraft } from "./draft.ts";
import { runScriptedDemo } from "./scripted.ts";

test("normalizeDraft never invents missing fields", () => {
  assert.deepEqual(normalizeDraft(null), {
    businessName: "",
    greeting: "",
    hours: "",
    services: "",
    faqs: "",
  });
  assert.deepEqual(
    normalizeDraft({
      businessName: "  Acme  ",
      extra: "ignore",
      greeting: 12,
      draft: { hours: "Mon–Fri" },
    }),
    {
      businessName: "",
      greeting: "",
      hours: "Mon–Fri",
      services: "",
      faqs: "",
    },
  );
});

test("engine is disabled when the flag is off", () => {
  const engine = createSandboxEngine({ enabled: false });
  const created = engine.createSession({ businessName: "Acme" });
  assert.equal(created.ok, false);
  if (!created.ok) {
    assert.equal(created.error, "sandbox_disabled");
    assert.equal(created.liveCall, false);
    assert.equal(created.liveNumber, null);
  }
});

test("create + describe + scripted test uses draft fields only", () => {
  const engine = createSandboxEngine({
    enabled: true,
    now: () => new Date("2026-09-20T12:00:00.000Z"),
  });
  const created = engine.createSession({
    businessName: "Acme Plumbing",
    greeting: "Warm homes, honest quotes",
    hours: "Mon–Fri 08:00–17:00",
    services: "Boiler repair",
    faqs: "Q: Do you cover London?\nA: Yes, within the M25.",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.data.kind, "sandbox");
  assert.equal(created.data.liveNumber, null);
  assert.equal(created.data.productionTelephony, false);
  assert.equal(created.data.frozenLivePathUntouched, true);
  assert.equal(created.data.knowledgePack.liveCall, false);
  assert.equal(created.data.knowledgePack.hours, "Mon–Fri 08:00–17:00");
  assert.match(created.data.systemPrompt, /not a live customer phone line/i);
  assert.ok(created.data.limitations.some((line) => /not a live customer phone number/i.test(line)));

  const described = engine.describeSession(created.data.id);
  assert.equal(described.ok, true);
  if (described.ok) {
    assert.equal(described.data.draft.businessName, "Acme Plumbing");
  }

  const testCall = engine.startTest({ sessionId: created.data.id, mode: "scripted" });
  assert.equal(testCall.ok, true);
  if (!testCall.ok) return;
  assert.equal(testCall.data.status, "scripted_demo_complete");
  assert.equal(testCall.data.liveCall, false);
  assert.equal(testCall.data.liveNumber, null);
  assert.equal(testCall.data.mode, "scripted");
  const receptionistTurns = testCall.data.turns.filter((turn) => turn.speaker === "receptionist");
  assert.ok(receptionistTurns.some((turn) => turn.text.includes("Warm homes")));
  assert.ok(receptionistTurns.some((turn) => turn.text.includes("Mon–Fri")));
  assert.ok(receptionistTurns.some((turn) => turn.text.includes("Boiler repair")));
  assert.ok(receptionistTurns.some((turn) => turn.text.includes("M25")));
  assert.ok(
    testCall.data.turns.some((turn) =>
      turn.text.includes("not a live phone call"),
    ),
  );
});

test("scripted demo states missing fields instead of inventing them", () => {
  const turns = runScriptedDemo({
    businessName: "",
    greeting: "",
    hours: "",
    services: "",
    faqs: "",
  });
  const missing = turns.filter((turn) => turn.source === "missing");
  assert.ok(missing.length >= 3);
  assert.ok(missing.some((turn) => /do not have opening hours/i.test(turn.text)));
  assert.ok(missing.some((turn) => /do not have services/i.test(turn.text)));
  assert.ok(missing.some((turn) => /do not have FAQs/i.test(turn.text)));
});

test("webrtc and live modes never invent a successful live call", () => {
  const engine = createSandboxEngine({ enabled: true });
  const created = engine.createSession({ businessName: "Acme" });
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const webrtc = engine.startTest({ sessionId: created.data.id, mode: "webrtc" });
  assert.equal(webrtc.ok, false);
  if (!webrtc.ok) {
    assert.equal(webrtc.error, "not_configured");
    assert.equal(webrtc.liveCall, false);
    assert.equal(webrtc.liveNumber, null);
  }

  const live = engine.startTest({ sessionId: created.data.id, mode: "live" });
  assert.equal(live.ok, false);
  if (!live.ok) {
    assert.equal(live.error, "live_call_forbidden");
    assert.equal(live.liveCall, false);
  }

  const twilio = engine.startTest({ sessionId: created.data.id, mode: "twilio" });
  assert.equal(twilio.ok, false);
  if (!twilio.ok) assert.equal(twilio.error, "live_call_forbidden");
});

test("unknown session and unknown mode stay honest", () => {
  const engine = createSandboxEngine({ enabled: true });
  const missing = engine.startTest({ sessionId: "nope", mode: "scripted" });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error, "session_not_found");

  const created = engine.createSession({});
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const bad = engine.startTest({ sessionId: created.data.id, mode: "carrier" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.error, "invalid_request");
});

test("create session stores a claims-safe knowledge pack even when hours are missing", () => {
  const engine = createSandboxEngine({ enabled: true });
  const created = engine.createSession({ businessName: "Acme" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.data.knowledgePack.hours, undefined);
  assert.ok(created.data.knowledgePack.missing.includes("hours"));
  assert.ok(created.data.knowledgePack.missing.includes("services"));
  assert.equal(created.data.liveNumber, null);
  assert.match(created.data.systemPrompt, /must stay missing: .*hours/i);
});

test("create session overlay cannot set liveCall or invent hours", () => {
  const engine = createSandboxEngine({ enabled: true });
  const created = engine.createSession({
    businessName: "Acme",
    knowledgePack: {
      businessName: "Acme Overlay",
      liveCall: true,
      liveNumber: "+44111",
      alwaysOn: true,
    },
    systemPrompt: "Custom sandbox prompt.",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.data.knowledgePack.businessName, "Acme Overlay");
  assert.equal(created.data.knowledgePack.liveCall, false);
  assert.equal(created.data.knowledgePack.liveNumber, null);
  assert.equal(created.data.knowledgePack.alwaysOn, false);
  assert.equal(created.data.knowledgePack.hours, undefined);
  assert.match(created.data.systemPrompt, /Custom sandbox prompt/);
  assert.match(created.data.systemPrompt, /not a live customer phone line|not always-on/i);
});

test("resolveTestMode maps aliases without inventing live success", () => {
  assert.equal(resolveTestMode(undefined), "scripted");
  assert.equal(resolveTestMode("browser-mock"), "browser_mock");
  assert.equal(resolveTestMode("production"), "live");
  assert.equal(resolveTestMode("carrier"), "invalid");
});
