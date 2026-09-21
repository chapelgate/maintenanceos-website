"use client";

import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";

const FIELD_CLASS = "mt-1 w-full rounded-md border border-border px-3 py-2";

/**
 * Compact editable preview of the claims-safe knowledge pack + system prompt.
 * Limitations stay read-only so live-phone / always-on claims cannot be dropped.
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

  return (
    <div data-receptionist-draft="preview" className="space-y-3">
      <p className="text-sm text-muted">
        Sandbox receptionist draft from the fields you reviewed — not a live
        number, not always-on, and not a trained knowledge base. Empty facts
        stay empty.
      </p>

      <div
        className="rounded-md border border-border bg-paper p-3"
        data-limitations="readonly"
      >
        <h3 className="text-sm font-semibold text-ink">
          Honest limitations{" "}
          <span className="font-normal text-muted">(read-only)</span>
        </h3>
        <ul
          className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted"
          aria-readonly="true"
        >
          {result.limitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {missing.length ? (
          <p className="mt-2 text-xs text-muted">
            Missing (not invented): {missing.join(", ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">
            Knowledge pack (editable JSON)
          </span>
          <textarea
            rows={8}
            value={packText}
            onChange={(e) => onPackTextChange(e.target.value)}
            spellCheck={false}
            className={`${FIELD_CLASS} font-mono text-xs`}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">
            System prompt draft (editable)
          </span>
          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => onPromptTextChange(e.target.value)}
            spellCheck={false}
            className={`${FIELD_CLASS} font-mono text-xs`}
          />
        </label>
      </div>
      {packError ? (
        <p className="text-sm text-red-700" role="alert">
          {packError}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        Trusted constraints are re-applied on submit and sandbox session create.
        This page will not claim a live number.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
      >
        Reset pack from reviewed draft
      </button>
    </div>
  );
}
