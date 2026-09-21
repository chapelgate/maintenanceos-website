/**
 * Sandbox test-call types for ReceptionistOS.
 * Never invent a live phone call: ok:true is only scripted / browser-mock.
 */

import type {
  KnowledgePack,
  ReceptionistDraftResult,
} from "../../receptionist-draft/src/index.ts";

export const SANDBOX_TEST_MODES = ["scripted", "browser_mock", "webrtc", "live"] as const;
export type SandboxTestMode = (typeof SANDBOX_TEST_MODES)[number];

export type ReceptionistDraft = {
  businessName: string;
  greeting: string;
  hours: string;
  services: string;
  faqs: string;
};

export type { KnowledgePack, ReceptionistDraftResult };

export type SandboxErrorCode =
  | "sandbox_disabled"
  | "not_configured"
  | "session_not_found"
  | "invalid_request"
  | "live_call_forbidden";

export type SandboxFailure = {
  ok: false;
  error: SandboxErrorCode;
  message: string;
  liveCall: false;
  liveNumber: null;
  productionTelephony: false;
};

export type SandboxSuccess<T> = {
  ok: true;
  data: T;
  liveCall: false;
  liveNumber: null;
  productionTelephony: false;
};

export type SandboxResult<T> = SandboxSuccess<T> | SandboxFailure;

export type SandboxSession = {
  id: string;
  kind: "sandbox";
  status: "ready";
  draft: ReceptionistDraft;
  knowledgePack: KnowledgePack;
  systemPrompt: string;
  limitations: string[];
  createdAt: string;
  liveCall: false;
  liveNumber: null;
  productionTelephony: false;
  frozenLivePathUntouched: true;
};

export type ScriptedTurnSource =
  | "script"
  | "draft.greeting"
  | "draft.hours"
  | "draft.services"
  | "draft.faqs"
  | "missing";

export type ScriptedTurn = {
  speaker: "caller" | "receptionist";
  text: string;
  source: ScriptedTurnSource;
};

export type SandboxTestKind = "scripted" | "browser_mock";

export type SandboxTest = {
  id: string;
  sessionId: string;
  mode: SandboxTestKind;
  status: "scripted_demo_complete";
  turns: ScriptedTurn[];
  liveCall: false;
  liveNumber: null;
  productionTelephony: false;
  frozenLivePathUntouched: true;
};

export type CreateSessionInput = Partial<ReceptionistDraft> & {
  knowledgePack?: unknown;
  systemPrompt?: unknown;
  limitations?: unknown;
};

export type StartTestInput = {
  sessionId: string;
  mode?: string;
};

export type EngineDeps = {
  env?: NodeJS.ProcessEnv;
  enabled?: boolean;
  now?: () => Date;
  store?: SandboxStore;
};

export type SandboxStore = {
  create(
    draft: ReceptionistDraft,
    now: Date,
    built: ReceptionistDraftResult,
  ): SandboxSession;
  get(id: string): SandboxSession | undefined;
  recordTest(test: SandboxTest): void;
  getTest(id: string): SandboxTest | undefined;
};

export function sandboxFailure(
  error: SandboxErrorCode,
  message: string,
): SandboxFailure {
  return {
    ok: false,
    error,
    message,
    liveCall: false,
    liveNumber: null,
    productionTelephony: false,
  };
}

export function sandboxSuccess<T>(data: T): SandboxSuccess<T> {
  return {
    ok: true,
    data,
    liveCall: false,
    liveNumber: null,
    productionTelephony: false,
  };
}
