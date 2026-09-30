"use client";

import { useId, useState } from "react";
import { siteConfig } from "@/config/site";
import {
  requestSandboxScriptedDemo,
  runBrowserInteractiveReply,
  type ScriptedTurn,
} from "@/lib/sandbox-test-call";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";
import {
  qualifyAgentSandbox,
  type AgentSandboxQualificationResult,
  type AgentSandboxReviewSubject,
} from "@/lib/agent-sandbox-qualification";

const QUICK_PROMPTS = [
  "What are your opening hours?",
  "What services do you offer?",
  "Can you book me an appointment tomorrow?",
  "I want to speak to a human.",
] as const;

function openingTurn(receptionist: ReceptionistDraftResult): ScriptedTurn {
  const pack = receptionist.knowledgePack;
  if (pack.greeting?.trim()) {
    return {
      speaker: "receptionist",
      text: pack.greeting.trim(),
      source: "knowledge.greeting",
    };
  }
  if (pack.businessName?.trim()) {
    return {
      speaker: "receptionist",
      text: `Hello, you're through to ${pack.businessName.trim()}. How can I help?`,
      source: "knowledge.businessName",
    };
  }
  return {
    speaker: "receptionist",
    text: "Hello, you're through to your receptionist preview. How can I help?",
    source: "missing",
  };
}

/**
 * Public call-style browser demo for the reviewed receptionist configuration.
 *
 * This is deliberately isolated from production telephony. It uses the same
 * deterministic pack-aware reply engine as the qualification benchmark, so a
 * visitor can test their own reviewed setup without a phone number, provider,
 * microphone permission, or live voice dependency.
 *
 * A configured companion can still perform engineering qualification behind
 * the existing feature flag, but that is secondary to the customer demo.
 */
export function SandboxTestCallPanel({
  receptionist = null,
  reviewSubject = null,
  onQualificationChange,
}: {
  draft?: unknown;
  receptionist?: ReceptionistDraftResult | null;
  reviewSubject?: AgentSandboxReviewSubject | null;
  onQualificationChange?: (
    result: AgentSandboxQualificationResult | null,
  ) => void;
}) {
  const endpoint = siteConfig.sandboxTestCallEndpoint.trim();
  const qualificationEnabled =
    siteConfig.sandboxTestCallEnabled && Boolean(endpoint) && Boolean(reviewSubject);

  const [started, setStarted] = useState(false);
  const [callerText, setCallerText] = useState("");
  const [turns, setTurns] = useState<ScriptedTurn[]>([]);
  const [qualificationState, setQualificationState] = useState<
    "idle" | "submitting" | "ok" | "error"
  >("idle");
  const [qualificationDetail, setQualificationDetail] = useState<string | null>(
    null,
  );
  const inputId = useId();

  function startDemo() {
    if (!receptionist) return;
    setTurns([openingTurn(receptionist)]);
    setCallerText("");
    setStarted(true);
  }

  function endDemo() {
    setStarted(false);
    setCallerText("");
    setTurns([]);
  }

  function sendCallerTurn(value = callerText) {
    const text = value.trim();
    if (!text || !receptionist) return;
    const reply = runBrowserInteractiveReply(
      text,
      receptionist.knowledgePack,
      receptionist.systemPrompt,
    );
    setTurns((current) => [
      ...current,
      { speaker: "caller", text, source: "caller" },
      reply,
    ]);
    setCallerText("");
  }

  async function runQualification() {
    if (!qualificationEnabled || !reviewSubject || !receptionist) return;
    setQualificationState("submitting");
    setQualificationDetail(null);
    onQualificationChange?.(null);

    const outcome = await requestSandboxScriptedDemo({
      enabled: true,
      endpoint,
      draft: {
        businessName: receptionist.knowledgePack.businessName ?? "",
        greeting: receptionist.knowledgePack.greeting ?? "",
        hours: receptionist.knowledgePack.hours ?? "",
        services: receptionist.knowledgePack.services?.join("\n") ?? "",
        faqs:
          receptionist.knowledgePack.faqs
            ?.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
            .join("\n\n") ?? "",
      },
      knowledgePack: receptionist.knowledgePack,
      systemPrompt: receptionist.systemPrompt,
    });

    if (outcome.status !== "ok") {
      setQualificationState("error");
      setQualificationDetail(
        "Configuration verification could not complete. The public interactive demo remains available and no live phone line was touched.",
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
        "Configuration verification passed for this exact reviewed setup.",
      );
      onQualificationChange?.(qualification);
    } catch {
      setQualificationState("error");
      setQualificationDetail(
        "Configuration verification failed closed. No live phone line was touched.",
      );
    }
  }

  return (
    <section
      id="interactive-receptionist-demo"
      className="scroll-mt-28 rounded-md border border-border bg-surface p-5"
      data-sandbox-test-call={started ? "interactive" : "ready"}
      data-interactive-receptionist-demo=""
      aria-labelledby="interactive-receptionist-heading"
    >
      <h2
        id="interactive-receptionist-heading"
        className="text-base font-semibold text-ink"
      >
        Try your receptionist
      </h2>
      <p className="mt-2 text-sm text-muted">
        Test the receptionist you just configured. Ask your own caller questions
        and see how it answers from the reviewed knowledge pack and safety rules.
        This browser demo does not dial a phone number or touch the live telephone
        service.
      </p>

      {!receptionist ? (
        <div className="mt-4 rounded-md border border-dashed border-border bg-paper p-4">
          <p className="text-sm font-medium text-ink">
            Complete the configuration above to unlock the demo.
          </p>
          <p className="mt-1 text-sm text-muted">
            Once the reviewed pack is generated, the test button appears here.
          </p>
        </div>
      ) : !started ? (
        <button
          type="button"
          onClick={startDemo}
          className="mt-4 inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
        >
          Start demo call
        </button>
      ) : (
        <div className="mt-5">
          <div
            className="max-h-[28rem] space-y-3 overflow-y-auto rounded-md border border-border bg-paper p-4"
            aria-live="polite"
            data-demo-transcript=""
          >
            {turns.map((turn, index) => (
              <div
                key={`${turn.speaker}-${index}`}
                className={
                  turn.speaker === "caller"
                    ? "ml-auto max-w-[88%] rounded-lg bg-accent px-3 py-2 text-sm text-on-accent"
                    : "mr-auto max-w-[88%] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink"
                }
              >
                <span className="sr-only">
                  {turn.speaker === "caller" ? "Caller" : "Receptionist"}:
                </span>
                {turn.text}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Example caller questions">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendCallerTurn(prompt)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
              >
                {prompt}
              </button>
            ))}
          </div>

          <label htmlFor={inputId} className="mt-4 block text-sm font-medium text-ink">
            What would the caller say?
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id={inputId}
              value={callerText}
              onChange={(event) => setCallerText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                sendCallerTurn();
              }}
              placeholder="e.g. What time are you open?"
              className="min-w-0 flex-1 rounded-md border border-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={!callerText.trim()}
              onClick={() => sendCallerTurn()}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-50"
            >
              Send
            </button>
          </div>

          <button
            type="button"
            onClick={endDemo}
            className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            End demo call
          </button>
        </div>
      )}

      {qualificationEnabled ? (
        <details className="mt-5 border-t border-border pt-4">
          <summary className="cursor-pointer text-xs font-medium text-muted">
            Engineering configuration verification
          </summary>
          <button
            type="button"
            disabled={qualificationState === "submitting"}
            onClick={() => void runQualification()}
            className="mt-3 inline-flex min-h-6 items-center justify-center rounded-md border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper disabled:opacity-60"
          >
            {qualificationState === "submitting"
              ? "Verifying…"
              : "Verify reviewed configuration"}
          </button>
          {qualificationDetail ? (
            <p
              className={
                qualificationState === "error"
                  ? "mt-2 text-xs text-red-700"
                  : "mt-2 text-xs text-muted"
              }
              role={qualificationState === "error" ? "alert" : "status"}
              data-sandbox-qualification={qualificationState}
            >
              {qualificationDetail}
            </p>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}
