"use client";

import { useId, useState } from "react";
import { siteConfig } from "@/config/site";
import {
  requestSandboxSession,
  requestSandboxTest,
  type ReceptionistDraft,
  type SandboxSession,
  type SandboxTest,
} from "@/lib/sandbox-test-call";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";

type SessionState = "idle" | "submitting" | "ok" | "error";
type TestState = "idle" | "submitting" | "ok" | "error";

const EMPTY_DRAFT: ReceptionistDraft = {
  businessName: "",
  greeting: "",
  hours: "",
  services: "",
  faqs: "",
};

/**
 * Honest sandbox test-call panel for /create.
 * Default: under testing / coming. Flag on: scripted demo against a stub.
 */
export function SandboxTestCallPanel({
  draft = EMPTY_DRAFT,
  receptionist = null,
}: {
  draft?: ReceptionistDraft;
  receptionist?: ReceptionistDraftResult | null;
}) {
  const enabled = siteConfig.sandboxTestCallEnabled;
  const endpoint = siteConfig.sandboxTestCallEndpoint.trim();
  const usesCompanion = Boolean(endpoint);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [testState, setTestState] = useState<TestState>("idle");
  const [detail, setDetail] = useState<string | null>(null);
  const [session, setSession] = useState<SandboxSession | null>(null);
  const [tested, setTested] = useState<SandboxTest | null>(null);
  const statusId = useId();

  async function onCreateSession() {
    setSessionState("submitting");
    setTestState("idle");
    setDetail(null);
    setTested(null);
    const outcome = await requestSandboxSession({
      enabled,
      endpoint,
      draft,
      knowledgePack: receptionist?.knowledgePack,
      systemPrompt: receptionist?.systemPrompt,
    });
    if (outcome.status === "ok") {
      setSession(outcome.data);
      setSessionState("ok");
      return;
    }
    setSession(null);
    setSessionState("error");
    setDetail(
      outcome.status === "disabled"
        ? "Sandbox test call is off in this build. No live call was placed."
        : outcome.message,
    );
  }

  async function onStartTest(mode: "scripted" | "webrtc") {
    if (!session) {
      setTestState("error");
      setDetail("Create a sandbox session first. No live call was placed.");
      return;
    }
    setTestState("submitting");
    setDetail(null);
    setTested(null);
    const outcome = await requestSandboxTest({
      enabled,
      endpoint,
      sessionId: session.id,
      mode,
    });
    if (outcome.status === "ok") {
      setTested(outcome.data);
      setTestState("ok");
      return;
    }
    setTestState("error");
    setTested(null);
    setDetail(
      outcome.status === "disabled"
        ? "Sandbox test call is off in this build. No live call was placed."
        : outcome.message,
    );
  }

  if (!enabled) {
    return (
      <section
        className="rounded-md border border-border bg-surface p-5"
        data-sandbox-test-call="off"
        aria-labelledby="sandbox-test-call-heading"
      >
        <h2
          id="sandbox-test-call-heading"
          className="text-base font-semibold text-ink"
        >
          Sandbox test call — under testing / coming
        </h2>
        <p className="mt-2 text-sm text-muted">
          A feature-flagged sandbox session lives in{" "}
          <code className="text-xs">packages/sandbox-test-call</code> behind{" "}
          <code className="text-xs">SANDBOX_TEST_CALL_ENABLED=false</code>{" "}
          (default off). This is not a live customer phone number, not
          production telephony, and the frozen live voice path is untouched.
        </p>
      </section>
    );
  }

  const hasDraftSignal = Object.values(draft).some((value) => value.trim());

  return (
    <section
      className="rounded-md border border-border bg-surface p-5"
      data-sandbox-test-call="on"
      data-sandbox-source={usesCompanion ? "companion" : "browser-mock"}
      aria-labelledby="sandbox-test-call-heading"
    >
      <h2
        id="sandbox-test-call-heading"
        className="text-base font-semibold text-ink"
      >
        Sandbox test call — local scripted demo
      </h2>
      <p className="mt-2 text-sm text-muted">
        This control is enabled in this build only.{" "}
        {usesCompanion
          ? "Sessions come from the companion service on loopback / staging."
          : "No sandbox endpoint is configured, so this uses an in-browser scripted stub."}{" "}
        It is not a live customer phone number, not production telephony, and it
        does not touch the frozen live voice path. Voice quality is not claimed
        as Fonio-parity.
      </p>
      <p className="mt-2 text-sm text-muted">
        {hasDraftSignal
          ? "The scripted demo will use the draft fields from the create journey (business name, greeting, hours, services, FAQs). If you previewed a knowledge pack, that pack and prompt are sent with the sandbox session. Empty fields stay empty."
          : "No draft fields have been entered yet. You can still create a sandbox session; missing answers will be stated as missing."}
      </p>

      <div id={statusId} className="mt-4 space-y-2 text-sm text-muted" aria-live="polite">
        {sessionState === "submitting" ? <p>Creating sandbox session…</p> : null}
        {testState === "submitting" ? <p>Starting scripted sandbox test…</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={sessionState === "submitting"}
          onClick={() => void onCreateSession()}
          className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          {sessionState === "submitting"
            ? "Creating session…"
            : "Create sandbox session from draft"}
        </button>
        <button
          type="button"
          disabled={!session || testState === "submitting"}
          onClick={() => void onStartTest("scripted")}
          className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-60"
        >
          {testState === "submitting"
            ? "Running scripted demo…"
            : "Start scripted sandbox test"}
        </button>
        <button
          type="button"
          disabled={!session || testState === "submitting"}
          onClick={() => void onStartTest("webrtc")}
          className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-60"
        >
          Try WebRTC / live media
        </button>
      </div>

      {sessionState === "ok" && session ? (
        <p className="mt-4 text-sm text-ink" role="status">
          Sandbox session <code className="text-xs">{session.id}</code> is ready.
          Live number: none. Production telephony: no.
        </p>
      ) : null}

      {testState === "ok" && tested ? (
        <div className="mt-4" role="status">
          <p className="text-sm text-ink">
            Scripted demo <code className="text-xs">{tested.id}</code> finished
            with status <code className="text-xs">{tested.status}</code>. This
            was not a live phone call.
          </p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            {tested.turns.map((turn, index) => (
              <li key={`${tested.id}-${index}`}>
                <span className="font-medium text-ink">
                  {turn.speaker === "caller" ? "Caller" : "Draft receptionist"}
                  :
                </span>{" "}
                {turn.text}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {sessionState === "error" || testState === "error" ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {detail ?? "The sandbox service did not confirm this action. No live call was placed."}
        </p>
      ) : null}
    </section>
  );
}
