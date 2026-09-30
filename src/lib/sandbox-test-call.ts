/**
 * Claims-safe sandbox test-call client for the static /create journey.
 * Talks to packages/sandbox-test-call over an absolute URL, or an in-browser
 * scripted mock when the public flag is on and no endpoint is configured.
 * Scripted turns read the stored knowledge pack / system prompt.
 * Never invents a successful live phone call.
 */

import {
  overlayReceptionistDraft,
  type KnowledgePack,
  type ReceptionistDraftResult,
} from "./receptionist-draft.ts";
import { runScriptedDemo, scriptedReply } from "../../packages/sandbox-test-call/src/scripted.ts";

export type ReceptionistDraft = {
  businessName: string;
  greeting: string;
  hours: string;
  services: string;
  faqs: string;
};

export type SandboxSession = {
  id: string;
  kind: "sandbox";
  status: string;
  draft: ReceptionistDraft;
  knowledgePack?: KnowledgePack;
  systemPrompt?: string;
  limitations?: string[];
  createdAt: string;
  liveCall: false;
  liveNumber: null;
};

export type ScriptedTurn = {
  speaker: "caller" | "receptionist";
  text: string;
  source: string;
};

export type SandboxTest = {
  id: string;
  sessionId: string;
  mode: string;
  status: string;
  turns: ScriptedTurn[];
  liveCall: false;
  liveNumber: null;
};

export type SandboxOutcome<T> =
  | { status: "disabled" }
  | { status: "ok"; data: T }
  | { status: "error"; code?: string; message: string };

const EMPTY_DRAFT: ReceptionistDraft = {
  businessName: "",
  greeting: "",
  hours: "",
  services: "",
  faqs: "",
};

export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sandboxEndpointBase(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function asDraftString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 4000);
}

export function normalizeClientDraft(input: unknown): ReceptionistDraft {
  const root = asRecord(input);
  const src = asRecord(root?.draft) ?? root ?? {};
  return {
    businessName: asDraftString(src.businessName),
    greeting: asDraftString(src.greeting),
    hours: asDraftString(src.hours),
    services: asDraftString(src.services),
    faqs: asDraftString(src.faqs),
  };
}

function attachReceptionist(
  draft: ReceptionistDraft,
  overlay?: { knowledgePack?: unknown; systemPrompt?: unknown },
): ReceptionistDraftResult {
  return overlayReceptionistDraft(draft, overlay);
}

function sessionFromDraft(
  id: string,
  draft: ReceptionistDraft,
  overlay?: { knowledgePack?: unknown; systemPrompt?: unknown },
  createdAt = "",
): SandboxSession {
  const built = attachReceptionist(draft, overlay);
  return {
    id,
    kind: "sandbox",
    status: "ready",
    draft,
    knowledgePack: built.knowledgePack,
    systemPrompt: built.systemPrompt,
    limitations: built.limitations,
    createdAt,
    liveCall: false,
    liveNumber: null,
  };
}

export function runBrowserScriptedDemo(
  pack: unknown,
  systemPrompt?: string,
): ScriptedTurn[] {
  return runScriptedDemo(pack, systemPrompt);
}

/**
 * One deterministic receptionist reply for the public interactive browser demo.
 * Uses the reviewed knowledge pack and trusted policy tail. It never places a
 * phone call or invents live integrations.
 */
export function runBrowserInteractiveReply(
  callerText: string,
  pack: unknown,
  systemPrompt?: string,
): ScriptedTurn {
  return scriptedReply(callerText, pack, systemPrompt);
}

/** Map only a confirmed sandbox session. Missing id → null (not invented). */
export function mapSessionResponse(body: unknown): SandboxSession | null {
  const root = asRecord(body);
  const src = asRecord(root?.data) ?? root;
  if (!src) return null;
  const id = asNonEmptyString(src.id);
  if (!id) return null;
  if (src.liveCall === true || src.liveNumber) return null;
  return sessionFromDraft(
    id,
    normalizeClientDraft(src),
    { knowledgePack: src.knowledgePack, systemPrompt: src.systemPrompt },
    asNonEmptyString(src.createdAt) || "",
  );
}

export function mapTestResponse(body: unknown): SandboxTest | null {
  const root = asRecord(body);
  const src = asRecord(root?.data) ?? root;
  if (!src) return null;
  const id = asNonEmptyString(src.id);
  const sessionId = asNonEmptyString(src.sessionId);
  if (!id || !sessionId) return null;
  if (src.liveCall === true || src.liveNumber) return null;
  const status = asNonEmptyString(src.status);
  if (status !== "scripted_demo_complete") return null;
  const turns: ScriptedTurn[] = [];
  if (Array.isArray(src.turns)) {
    for (const item of src.turns) {
      const rec = asRecord(item);
      const speaker = rec?.speaker;
      const text = asNonEmptyString(rec?.text);
      if ((speaker !== "caller" && speaker !== "receptionist") || !text) continue;
      turns.push({
        speaker,
        text,
        source: asNonEmptyString(rec?.source) || "script",
      });
    }
  }
  return {
    id,
    sessionId,
    mode: asNonEmptyString(src.mode) || "scripted",
    status,
    turns,
    liveCall: false,
    liveNumber: null,
  };
}

type BrowserMockState = {
  sessions: Map<string, SandboxSession>;
  seq: number;
  testSeq: number;
};

const browserMock: BrowserMockState = {
  sessions: new Map(),
  seq: 0,
  testSeq: 0,
};

export function resetBrowserSandboxMock(): void {
  browserMock.sessions.clear();
  browserMock.seq = 0;
  browserMock.testSeq = 0;
}

function browserCreateSession(
  draft: ReceptionistDraft,
  overlay?: { knowledgePack?: unknown; systemPrompt?: unknown },
): SandboxOutcome<SandboxSession> {
  browserMock.seq += 1;
  const session = sessionFromDraft(
    `browser_sandbox_${browserMock.seq}`,
    { ...EMPTY_DRAFT, ...normalizeClientDraft(draft) },
    overlay,
    new Date().toISOString(),
  );
  browserMock.sessions.set(session.id, session);
  return { status: "ok", data: session };
}

function browserStartTest(
  sessionId: string,
  mode: string,
): SandboxOutcome<SandboxTest> {
  const session = browserMock.sessions.get(sessionId);
  if (!session) {
    return {
      status: "error",
      code: "session_not_found",
      message: "That sandbox session was not found. No live call was placed.",
    };
  }
  const resolved = (mode || "scripted").trim().toLowerCase();
  if (resolved === "live" || resolved === "production" || resolved === "twilio") {
    return {
      status: "error",
      code: "live_call_forbidden",
      message:
        "Live / production telephony is forbidden on this path. Frozen live voice is untouched. No phone number was provisioned.",
    };
  }
  if (resolved === "webrtc") {
    return {
      status: "error",
      code: "not_configured",
      message:
        "WebRTC / live media is not configured. This page will not invent a live phone call. Use the scripted sandbox demo instead.",
    };
  }
  if (resolved !== "scripted" && resolved !== "browser_mock" && resolved !== "browser-mock") {
    return {
      status: "error",
      code: "invalid_request",
      message:
        "Unknown test mode. Allowed: scripted, browser_mock. Live telephony is never available here.",
    };
  }
  browserMock.testSeq += 1;
  return {
    status: "ok",
    data: {
      id: `browser_sandbox_test_${browserMock.testSeq}`,
      sessionId: session.id,
      mode: resolved === "scripted" ? "scripted" : "browser_mock",
      status: "scripted_demo_complete",
      turns: runBrowserScriptedDemo(session.knowledgePack, session.systemPrompt),
      liveCall: false,
      liveNumber: null,
    },
  };
}

const REQUEST_TIMEOUT_MS = 12_000;

async function postSandbox<T>(
  url: string,
  payload: unknown,
  map: (body: unknown) => T | null,
  emptyError: string,
): Promise<SandboxOutcome<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    const rec = asRecord(parsed);
    if (!res.ok) {
      return {
        status: "error",
        code: asNonEmptyString(rec?.error),
        message:
          asNonEmptyString(rec?.message) ||
          "The sandbox service did not confirm this request. No live call was placed.",
      };
    }
    const mapped = map(parsed);
    if (!mapped) {
      return { status: "error", message: emptyError };
    }
    return { status: "ok", data: mapped };
  } catch {
    return {
      status: "error",
      message:
        "The sandbox service is unavailable just now. No live call was placed.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function requestSandboxSession(input: {
  enabled: boolean;
  endpoint: string;
  draft: ReceptionistDraft;
  knowledgePack?: KnowledgePack;
  systemPrompt?: string;
}): Promise<SandboxOutcome<SandboxSession>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = sandboxEndpointBase(input.endpoint);
  const draft = normalizeClientDraft(input.draft);
  const overlay = {
    knowledgePack: input.knowledgePack,
    systemPrompt: input.systemPrompt,
  };
  if (!endpoint) return browserCreateSession(draft, overlay);
  if (!isAbsoluteHttpUrl(endpoint)) {
    return {
      status: "error",
      message:
        "Sandbox endpoint is not a valid http(s) URL. Static export cannot use relative API routes. No live call was placed.",
    };
  }
  const payload: Record<string, unknown> = { ...draft };
  if (input.knowledgePack) payload.knowledgePack = input.knowledgePack;
  if (input.systemPrompt) payload.systemPrompt = input.systemPrompt;
  return postSandbox(
    `${endpoint}/sessions`,
    payload,
    mapSessionResponse,
    "The sandbox service did not return a session id. No live call was placed.",
  );
}

export async function requestSandboxTest(input: {
  enabled: boolean;
  endpoint: string;
  sessionId: string;
  mode?: string;
}): Promise<SandboxOutcome<SandboxTest>> {
  if (!input.enabled) return { status: "disabled" };
  const endpoint = sandboxEndpointBase(input.endpoint);
  const mode = input.mode ?? "scripted";
  if (!endpoint) return browserStartTest(input.sessionId, mode);
  if (!isAbsoluteHttpUrl(endpoint)) {
    return {
      status: "error",
      message:
        "Sandbox endpoint is not a valid http(s) URL. No live call was placed.",
    };
  }
  return postSandbox(
    `${endpoint}/sessions/${encodeURIComponent(input.sessionId)}/test-call`,
    { mode },
    mapTestResponse,
    "The sandbox service did not return a scripted demo. No live call was invented.",
  );
}

export type SandboxScriptedDemo = {
  session: SandboxSession;
  test: SandboxTest;
};

/** One-click pack-aware scripted demo: create session, then run scripted test. */
export async function requestSandboxScriptedDemo(input: {
  enabled: boolean;
  endpoint: string;
  draft: ReceptionistDraft;
  knowledgePack?: KnowledgePack;
  systemPrompt?: string;
}): Promise<SandboxOutcome<SandboxScriptedDemo>> {
  const session = await requestSandboxSession(input);
  if (session.status !== "ok") return session;
  const test = await requestSandboxTest({
    enabled: input.enabled,
    endpoint: input.endpoint,
    sessionId: session.data.id,
    mode: "scripted",
  });
  if (test.status !== "ok") return test;
  return { status: "ok", data: { session: session.data, test: test.data } };
}
