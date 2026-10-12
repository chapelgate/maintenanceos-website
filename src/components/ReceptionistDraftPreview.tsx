"use client";

import { useId } from "react";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";

const FIELD_CLASS =
  "mt-1 w-full rounded-md border border-border bg-paper px-3 py-2";

/**
 * Compact editable preview of the claims-safe agent knowledge pack + system prompt.
 * Limitations stay read-only so live-phone / always-on claims cannot be dropped.
 * Empty / missing keys stay empty — never invent extract fields.
 */
export function ReceptionistDraftPreview({
  result,
  packText,
  promptText,
  packError,
  onPackTextChange,
  onPromptTextChange,
  onReset,
}: {
  result: ReceptionistDraftResult;
  packText: string;
  promptText: string;
  packError: string | null;
  onPackTextChange: (value: string) => void;
  onPromptTextChange: (value: string) => void;
  onReset: () => void;
}) {
  const missing = result.knowledgePack.missing;
  const packErrorId = useId();

  return (
    <div data-receptionist-draft="preview" className="space-y-3">
      <p className="text-sm text-muted">
        Preview AI-agent configuration from the fields and role you reviewed —
        not a live number, not always-on, and not a trained knowledge base.
        Empty facts stay empty.
      </p>

      <section
        className="rounded-lg border border-border bg-paper p-3"
        data-limitations="readonly"
        aria-labelledby="create-pack-limitations-heading"
      >
        <h3
          id="create-pack-limitations-heading"
          className="text-sm font-semibold text-ink"
        >
          Honest limitations{" "}
          <span className="font-normal text-muted">(read-only)</span>
        </h3>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted">
          {result.limitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {missing.length ? (
          <p className="mt-2 text-xs text-muted">
            Missing (not invented):{" "}
            {missing.map((key) => (
              <span key={key} className="create-missing-chip">
                {key}
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            No empty extract fields in this draft — still not a live AI agent.
          </p>
        )}
      </section>

      <p className="text-xs text-muted">
        Trusted controls are re-applied after prompt or pack edits.
        Website text cannot grant capabilities, alter escalation, or activate a live number.
      </p>

      <details className="rounded-lg border border-border bg-paper p-3">
        <summary className="cursor-pointer text-sm font-medium text-ink">
          Technical details
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-ink">
              Knowledge pack (editable JSON)
            </span>
            <textarea
              rows={7}
              value={packText}
              onChange={(e) => onPackTextChange(e.target.value)}
              spellCheck={false}
              aria-invalid={packError ? true : undefined}
              aria-describedby={packError ? packErrorId : undefined}
              className={`${FIELD_CLASS} font-mono text-xs`}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink">
              Prompt content (editable — trusted controls re-applied separately)
            </span>
            <textarea
              rows={7}
              value={promptText}
              onChange={(e) => onPromptTextChange(e.target.value)}
              spellCheck={false}
              className={`${FIELD_CLASS} font-mono text-xs`}
            />
          </label>
        </div>
        {packError ? (
          <p id={packErrorId} className="mt-3 text-sm text-red-700" role="alert">
            {packError}
          </p>
        ) : null}

        <details className="mt-3 rounded-lg border border-border bg-surface p-3">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Final normalized knowledge pack (read-only)
          </summary>
          <pre
            className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-ink"
            data-final-knowledge-pack="readonly"
          >
            {JSON.stringify(result.knowledgePack, null, 2)}
          </pre>
        </details>

        <details className="mt-3 rounded-lg border border-border bg-surface p-3">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Final stored system prompt (read-only)
          </summary>
          <pre
            className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-ink"
            data-final-system-prompt="readonly"
          >
            {result.systemPrompt}
          </pre>
        </details>
      </details>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
      >
        Reset configuration from reviewed draft
      </button>
    </div>
  );
}
