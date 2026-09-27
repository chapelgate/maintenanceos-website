"use client";

import { useId, useState } from "react";
import { SandboxTestCallComingSoon } from "@/components/SandboxTestCallComingSoon";
import { siteConfig } from "@/config/site";
import {
  requestSandboxScriptedDemo,
  requestSandboxSession,
  requestSandboxTest,
  type ReceptionistDraft,
  type SandboxSession,
  type SandboxTest,
} from "@/lib/sandbox-test-call";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";
import {
  qualifyAgentSandbox,
  type AgentSandboxQualificationResult,
  type AgentSandboxReviewSubject,
} from "@/lib/agent-sandbox-qualification";

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
  reviewSubject = null,
  onQualificationChange,
}: {
  draft?: ReceptionistDraft;
  receptionist?: ReceptionistDraftResult | null;
  reviewSubject?: AgentSandboxReviewSubject | null;
  onQualificationChange?: (
    result: AgentSandboxQualificationResult | null,
  ) => void;
}) {
  const enabled = siteConfig.sandboxTestCallEnabled;
  const endpoint = siteConfig.sandboxTestCallEndpoint.trim();
  const usesCompanion = Boolean(endpoint);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [testState, setTestState] = useState<TestState>("idle");
  const [detail, setDetail] = useState<string | null>(null);
  const [session, setSession] = useState<SandboxSession | null>(null);
  const [tested, setTested] = useState<SandboxTest | null>(null);
  const [qualificationState, setQualificationState] = useState<
    "idle" | "ok" | "error"
  >("idle");
  const [qualificationDetail, setQualificationDetail] = useState<string | null>(
    null,
  );
  const statusId = useId();
  const comingCopyId = "sandbox-test-call-enabled-copy";
  async function onRunScriptedDemo() {
    setSessionState("submitting");
    setTestState("submitting");
    setDetail(null);
    setTested(null);
    setQualificationState("idle");
    setQualificationDetail(null);
    onQualificationChange?.(null);
    const outcome = await requestSandboxScriptedDemo({
      enabled,
      endpoint,
      draft,
      knowledgePack: receptionist?.knowledgePack,
      systemPrompt: receptionist?.systemPrompt,
    });
    if (outcome.status === "ok") {
      setSession(outcome.data.session);
      setTested(outcome.data.test);
      setSessionState("ok");
      setTestState("ok");

      if (!reviewSubject) {
        setQualificationDetail(
          "Scripted demo passed, but the exact customer review is not complete yet. Complete review before qualification.",
        );
        return;
      }
      if (!usesCompanion) {
        setQualificationDetail(
          "Browser scripted demo passed. It is demo-only and cannot award sandbox qualification; a configured sandbox companion is required.",
        );
        return;
      }
      try {
        const qualification = qualifyAgentSandbox({
          review: reviewSubject,
          source: "companion",
          session: outcome.data.session,
          test: outcome.data.test,
        });
        setQualificationState("ok");
        setQualificationDetail(
          "Sandbox qualification passed for this exact reviewed configuration. No live phone call or production number was used.",
        );
        onQualificationChange?.(qualification);
      } catch (qualificationError) {
        setQualificationState("error");
        setQualificationDetail(
          qualificationError instanceof Error
            ? qualificationError.message
            : "Sandbox qualification failed closed.",
        );
      }
      return;
    }
    setSession(null);
    setTested(null);
    setSessionState("error");
    setTestState("error");
    setDetail(
      outcome.status === "disabled"
        ? "Sandbox test call is off in this build. No live call was placed."
        : outcome.message,
    );
  }

  async function onTryWebrtc() {
    onQualificationChange?.(null);
    setQualificationState("idle");
    setQualificationDetail(null);
    setSessionState("submitting");
    setTestState("idle");
    setDetail(null);
    setTested(null);
    const created = await requestSandboxSession({
      enabled,
      endpoint,
      draft,
      knowledgePack: receptionist?.knowledgePack,
      systemPrompt: receptionist?.systemPrompt,
    });
    if (created.status !== "ok") {
      setSession(null);
      setSessionState("error");
      setTestState("error");
      setDetail(
        created.status === "disabled"
          ? "Sandbox test call is off in this build. No live call was placed."
          : created.message,
      );
      return;
    }
    setSession(created.data);
    setSessionState("ok");
    setTestState("submitting");
    const outcome = await requestSandboxTest({
      enabled,
      endpoint,
      sessionId: created.data.id,
      mode: "webrtc",
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
    return <SandboxTestCallComingSoon />;
  }

  const hasDraftSignal = Object.values(draft).some((value) => value.trim());

  return (
    <section
      className="rounded-md border border-border bg-surface p-5"
      data-sandbox-test-call="on"
      data-sandbox-source={usesCompanion ? "companion" : "browser-mock"}
      aria-labelledby="sandbox-test-call-heading"
      aria-describedby={comingCopyId}
    >
      <h2
        id="sandbox-test-call-heading"
        className="text-base font-semibold text-ink"
      >
        Sandbox test call — local scripted demo
      </h2>
      <p id={comingCopyId} className="mt-2 text-sm text-muted">
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
          ? "One click runs a pack-aware scripted demo from the stored knowledge pack (name, hours, services, FAQs). Missing facts stay not on file — never invented. This is still not a live phone call."
          : "No draft fields yet. One click still runs the scripted demo; missing pack facts are answered as not on file."}
      </p>

      <div id={statusId} className="mt-4 space-y-2 text-sm text-muted" aria-live="polite">
        {sessionState === "submitting" && testState !== "submitting" ? (
          <p>Creating sandbox session…</p>
        ) : null}
        {testState === "submitting" ? <p>Running pack-aware scripted demo…</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={sessionState === "submitting" || testState === "submitting"}
          onClick={() => void onRunScriptedDemo()}
          className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          {testState === "submitting"
            ? "Running scripted demo…"
            : usesCompanion && reviewSubject
              ? "Run sandbox qualification"
              : "Run pack-aware scripted demo"}
        </button>
        <button
          type="button"
          disabled={sessionState === "submitting" || testState === "submitting"}
          onClick={() => void onTryWebrtc()}
          className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-60"
        >
          WebRTC / live media (not configured)
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

      {qualificationDetail ? (
        <p
          className={
            qualificationState === "error"
              ? "mt-4 text-sm text-red-700"
              : qualificationState === "ok"
                ? "mt-4 text-sm font-medium text-ink"
                : "mt-4 text-sm text-muted"
          }
          role={qualificationState === "error" ? "alert" : "status"}
          data-sandbox-qualification={qualificationState}
        >
          {qualificationDetail}
        </p>
      ) : null}

      {sessionState === "error" || testState === "error" ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {detail ?? "The sandbox service did not confirm this action. No live call was placed."}
        </p>
      ) : null}
    </section>
  );
}
