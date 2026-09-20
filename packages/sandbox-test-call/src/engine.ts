import { normalizeDraft } from "./draft.ts";
import { isSandboxTestCallEnabled } from "./flags.ts";
import { runScriptedDemo } from "./scripted.ts";
import { createMemoryStore } from "./store.ts";
import {
  sandboxFailure,
  sandboxSuccess,
  type CreateSessionInput,
  type EngineDeps,
  type SandboxResult,
  type SandboxSession,
  type SandboxTest,
  type SandboxTestKind,
  type StartTestInput,
} from "./types.ts";

const DISABLED_MESSAGE =
  "Sandbox test call is disabled. Set SANDBOX_TEST_CALL_ENABLED=true to enable. No live call was placed.";

const LIVE_FORBIDDEN_MESSAGE =
  "Live / production telephony is forbidden on this path. Frozen live voice is untouched. No phone number was provisioned.";

const WEBRTC_NOT_CONFIGURED =
  "WebRTC / live media is not configured. This companion will not invent a live phone call. Use mode=scripted (or browser_mock) for the local demo.";

export function resolveTestMode(raw: string | undefined): "scripted" | "browser_mock" | "webrtc" | "live" | "invalid" {
  const mode = (raw ?? "scripted").trim().toLowerCase();
  if (!mode || mode === "scripted") return "scripted";
  if (mode === "browser_mock" || mode === "browser-mock") return "browser_mock";
  if (mode === "webrtc") return "webrtc";
  if (mode === "live" || mode === "production" || mode === "twilio") return "live";
  return "invalid";
}

export function createSandboxEngine(deps: EngineDeps = {}) {
  const env = deps.env ?? process.env;
  const enabled = deps.enabled ?? isSandboxTestCallEnabled(env);
  const store = deps.store ?? createMemoryStore();
  const now = () => deps.now?.() ?? new Date();
  let testSeq = 0;

  return {
    createSession(input: CreateSessionInput = {}): SandboxResult<SandboxSession> {
      if (!enabled) return sandboxFailure("sandbox_disabled", DISABLED_MESSAGE);
      const session = store.create(normalizeDraft(input), now());
      return sandboxSuccess(session);
    },

    describeSession(id: string): SandboxResult<SandboxSession> {
      if (!enabled) return sandboxFailure("sandbox_disabled", DISABLED_MESSAGE);
      const trimmed = id.trim();
      if (!trimmed) {
        return sandboxFailure(
          "invalid_request",
          "A sandbox session id is required. No live call was placed.",
        );
      }
      const session = store.get(trimmed);
      if (!session) {
        return sandboxFailure(
          "session_not_found",
          "That sandbox session was not found. No live call was placed.",
        );
      }
      return sandboxSuccess(session);
    },

    startTest(input: StartTestInput): SandboxResult<SandboxTest> {
      if (!enabled) return sandboxFailure("sandbox_disabled", DISABLED_MESSAGE);
      const sessionId = input.sessionId.trim();
      if (!sessionId) {
        return sandboxFailure(
          "invalid_request",
          "A sandbox session id is required. No live call was placed.",
        );
      }
      const session = store.get(sessionId);
      if (!session) {
        return sandboxFailure(
          "session_not_found",
          "That sandbox session was not found. No live call was placed.",
        );
      }

      const mode = resolveTestMode(input.mode);
      if (mode === "invalid") {
        return sandboxFailure(
          "invalid_request",
          "Unknown test mode. Allowed: scripted, browser_mock, webrtc. Live telephony is never available here.",
        );
      }
      if (mode === "live") {
        return sandboxFailure("live_call_forbidden", LIVE_FORBIDDEN_MESSAGE);
      }
      if (mode === "webrtc") {
        return sandboxFailure("not_configured", WEBRTC_NOT_CONFIGURED);
      }

      testSeq += 1;
      const kind: SandboxTestKind = mode;
      const test: SandboxTest = {
        id: `sandbox_test_${testSeq}`,
        sessionId: session.id,
        mode: kind,
        status: "scripted_demo_complete",
        turns: runScriptedDemo(session.draft),
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
        frozenLivePathUntouched: true,
      };
      store.recordTest(test);
      return sandboxSuccess(test);
    },
  };
}

export type SandboxEngine = ReturnType<typeof createSandboxEngine>;
