"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { ReceptionistDraftPreview } from "@/components/ReceptionistDraftPreview";
import { siteConfig } from "@/config/site";
import { submitLead } from "@/lib/lead-adapter";
import {
  CREATE_JOURNEY_STEPS,
  EMPTY_RECEPTIONIST_DRAFT,
  buildCreateLeadMessage,
  createJourneyNextAction,
  createScanProgressTitle,
  emptyHoursOrServicesNote,
  hostnameBusinessHint,
  isCreateScanReady,
  isValidEmail,
  normalisePublicUrl,
  requestOnboardingScan,
  scanFieldReviewHint,
  type CreateJourneyStep,
  type CreateScanProgress,
  type DraftFieldMeta,
  type ReceptionistDraft,
  type ScanDraftFieldMeta,
} from "@/lib/onboarding-create";
import {
  buildReceptionistDraft,
  finalizeSystemPrompt,
  limitationsFor,
  normalizeKnowledgePack,
  type ReceptionistDraftResult,
} from "@/lib/receptionist-draft";

type Status = "idle" | "submitting" | "success" | "error";

function scanNoteFor(progress: CreateScanProgress): string {
  switch (progress) {
    case "scanned":
      return "scan_response_mapped";
    case "scanned_empty":
      return "scan_response_empty";
    case "scan_failed":
      return "scan_failed_no_invented_content";
    case "queued":
    default:
      return "not_configured_queued";
  }
}

const FIELD_CLASS = "mt-1 w-full rounded-md border border-border px-3 py-2";

function DraftReviewField({
  label,
  value,
  onChange,
  meta,
  hintId,
  rows,
  placeholder,
  emptyNote,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  meta: DraftFieldMeta | undefined;
  hintId: string;
  rows?: number;
  placeholder?: string;
  emptyNote?: string | null;
}) {
  const hint = emptyNote || scanFieldReviewHint(meta, value);
  const describedBy = hint ? hintId : undefined;
  const empty = !value.trim() && Boolean(emptyNote);
  const fieldClass = empty ? `${FIELD_CLASS} border-dashed` : FIELD_CLASS;
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink">
        {label}
        {empty ? (
          <span className="ml-2 font-normal text-muted">Empty</span>
        ) : null}
      </span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={describedBy}
          className={fieldClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={describedBy}
          className={fieldClass}
        />
      )}
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </label>
  );
}

/**
 * Claims-safe website→receptionist early-access flow.
 * Business URL goes in `message` because `website` is the honeypot on submitLead.
 */
export function CreateReceptionistForm({
  onDraftChange,
  onReceptionistChange,
}: {
  onDraftChange?: (draft: ReceptionistDraft) => void;
  onReceptionistChange?: (built: ReceptionistDraftResult | null) => void;
} = {}) {
  const [step, setStep] = useState<CreateJourneyStep>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<CreateScanProgress>("checking");
  const [scanDetail, setScanDetail] = useState<string | null>(null);
  const [businessUrl, setBusinessUrl] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [draft, setDraft] = useState<ReceptionistDraft>(EMPTY_RECEPTIONIST_DRAFT);
  const [fieldMeta, setFieldMeta] = useState<ScanDraftFieldMeta>({});
  const [receptionist, setReceptionist] = useState<ReceptionistDraftResult | null>(
    null,
  );
  const [packText, setPackText] = useState("");
  const [promptText, setPromptText] = useState("");
  const [packError, setPackError] = useState<string | null>(null);
  const errorId = useId();
  const progressId = useId();
  const businessNameHintId = useId();
  const greetingHintId = useId();
  const hoursHintId = useId();
  const servicesHintId = useId();
  const faqsHintId = useId();

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    onReceptionistChange?.(receptionist);
  }, [receptionist, onReceptionistChange]);

  function applyBuilt(built: ReceptionistDraftResult) {
    setReceptionist(built);
    setPackText(JSON.stringify(built.knowledgePack, null, 2));
    setPromptText(built.systemPrompt);
    setPackError(null);
  }

  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;

    (async () => {
      setProgress("checking");
      setScanDetail(null);
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (cancelled) return;

      const endpoint = siteConfig.onboardingScanEndpoint.trim();
      if (!endpoint) {
        setDraft({
          ...EMPTY_RECEPTIONIST_DRAFT,
          businessName: hostnameBusinessHint(businessUrl),
        });
        setFieldMeta({});
        setProgress("queued");
        return;
      }

      setProgress("scanning");
      const outcome = await requestOnboardingScan(endpoint, businessUrl);
      if (cancelled) return;
      if (outcome.status === "ok") {
        const filled = Object.keys(outcome.draft).length > 0;
        setDraft({ ...EMPTY_RECEPTIONIST_DRAFT, ...outcome.draft });
        setFieldMeta(outcome.fieldMeta);
        setProgress(filled ? "scanned" : "scanned_empty");
        return;
      }
      if (outcome.status === "disabled") {
        setDraft({
          ...EMPTY_RECEPTIONIST_DRAFT,
          businessName: hostnameBusinessHint(businessUrl),
        });
        setFieldMeta({});
        setProgress("queued");
        return;
      }
      setDraft(EMPTY_RECEPTIONIST_DRAFT);
      setFieldMeta({});
      setScanDetail(outcome.message);
      setProgress("scan_failed");
    })();

    return () => {
      cancelled = true;
    };
  }, [step, businessUrl]);

  function updateDraft<K extends keyof ReceptionistDraft>(
    key: K,
    value: string,
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function onStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    if (String(fd.get("website") ?? "").trim()) {
      setStatus("success");
      return;
    }

    const nextUrl = normalisePublicUrl(String(fd.get("businessUrl") ?? ""));
    if (!nextUrl) {
      setError(
        "Enter a valid public website URL (for example https://example.com).",
      );
      setStatus("error");
      return;
    }
    const nextEmail = String(fd.get("email") ?? "").trim();
    if (!isValidEmail(nextEmail)) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setBusinessUrl(nextUrl);
    setEmail(nextEmail);
    setName(String(fd.get("name") ?? "").trim());
    setOrganisation(String(fd.get("organisation") ?? "").trim());
    setDraft(EMPTY_RECEPTIONIST_DRAFT);
    setFieldMeta({});
    setReceptionist(null);
    setPackText("");
    setPromptText("");
    setPackError(null);
    setStatus("idle");
    setStep(2);
  }

  async function onSubmitLead() {
    setError(null);
    setStatus("submitting");
    const result = await submitLead({
      leadType: "create_receptionist",
      email,
      name,
      organisation,
      message: buildCreateLeadMessage({
        businessUrl,
        draft,
        scanNote: scanNoteFor(progress),
        fieldMeta,
        receptionist,
      }),
      website: "",
    });

    if (!result.ok) {
      setError(
        result.error ||
          "We could not submit just now. Please try again shortly.",
      );
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div
        className="rounded-md border border-border bg-surface p-6"
        role="status"
      >
        <p className="font-semibold text-ink">You are on the list</p>
        <p className="mt-2 text-sm text-muted">
          Thanks — we recorded your website-to-receptionist early access
          request, including the draft you reviewed. No live phone number was
          provisioned, no confirmation email was sent, and no always-on
          receptionist was created.
        </p>
      </div>
    );
  }

  const stepReady = isCreateScanReady(progress);
  const nextAction = createJourneyNextAction(step, progress);

  return (
    <div
      className="rounded-md border border-border bg-surface p-6 shadow-sm"
      data-lead-type="create_receptionist"
      data-create-step={step}
      data-create-next-action={nextAction}
    >
      <ol
        className="mb-3 grid grid-cols-4 gap-2 text-center text-xs font-medium"
        aria-label="Create receptionist steps"
      >
        {CREATE_JOURNEY_STEPS.map((item) => {
          const current = item.step === step;
          const done = item.step < step;
          return (
            <li
              key={item.step}
              aria-current={current ? "step" : undefined}
              className={
                current
                  ? "rounded-md bg-accent-subtle px-2 py-2 text-ink"
                  : done
                    ? "rounded-md px-2 py-2 text-ink"
                    : "rounded-md px-2 py-2 text-muted"
              }
            >
              <span className="block text-[0.7rem] uppercase tracking-wide">
                Step {item.step}
              </span>
              {item.label}
            </li>
          );
        })}
      </ol>
      <p className="mb-6 text-sm text-muted">
        Next: {nextAction}
        {step === 4
          ? ". Optional scripted sandbox demo is below when the local flag is on — not a live phone."
          : null}
      </p>

      {step === 1 ? (
        <form onSubmit={onStep1} noValidate className="relative overflow-hidden">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink">Business website URL</span>
              <input
                name="businessUrl"
                type="url"
                inputMode="url"
                autoComplete="url"
                required
                defaultValue={businessUrl}
                placeholder="https://your-business.co.uk"
                className={FIELD_CLASS}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink">Name</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={name}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink">Email (required)</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={email}
                aria-invalid={status === "error" || undefined}
                aria-describedby={
                  status === "error" && error ? errorId : undefined
                }
                className={FIELD_CLASS}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink">Organisation</span>
              <input
                name="organisation"
                type="text"
                autoComplete="organization"
                defaultValue={organisation}
                className={FIELD_CLASS}
              />
            </label>
          </div>
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>
              Website
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          {error ? (
            <p id={errorId} className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
          >
            Check this website
          </button>
          <p className="mt-3 text-xs text-muted">
            Pre-launch capture only. Checking this website does not scan a live
            phone line and does not create a receptionist.
          </p>
        </form>
      ) : null}

      {step === 2 ? (
        <div>
          <div
            id={progressId}
            className="space-y-3 text-sm text-muted"
            aria-live="polite"
          >
            <p className="font-medium text-ink">{createScanProgressTitle(progress)}</p>
            <p>
              We only accept a public website address here. Private or internal
              hosts are not fetched from this page.
            </p>
            {progress === "scanning" ? (
              <p>Asking the configured scan service for this URL…</p>
            ) : null}
            {progress === "queued" ? (
              <p>
                Website crawl is queued for early access. No scan endpoint is
                configured on this static site, so we will not invent crawl
                results. You can still review a blank draft — the business name
                is suggested from the website address only.
              </p>
            ) : null}
            {progress === "scanned" ? (
              <p>
                A scan response was received. Only fields the service returned
                are filled. Please review them — this is not a live receptionist
                and no phone number was assigned.
              </p>
            ) : null}
            {progress === "scanned_empty" ? (
              <p>
                The scan service responded but returned no extractable fields.
                Nothing was invented. You can complete the draft yourself.
              </p>
            ) : null}
            {progress === "scan_failed" ? (
              <p>
                {scanDetail ??
                  "The scan service could not be reached. No crawl results were invented."}
              </p>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setError(null);
                setStep(1);
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!stepReady}
              onClick={() => {
                setStatus("idle");
                setError(null);
                setStep(3);
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
            >
              {stepReady ? createJourneyNextAction(2, progress) : "Checking…"}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStatus("idle");
            setError(null);
            applyBuilt(buildReceptionistDraft(draft));
            setStep(4);
          }}
        >
          <p className="text-sm text-muted">
            {progress === "scanned"
              ? "Edit anything the scan returned. Empty fields were not invented. Where the scan copied a value, a source and confidence hint appears under that field."
              : progress === "queued"
                ? "These fields are a draft for early access. The business name is from your website address, not from a crawl."
                : "Complete what you can. We did not invent crawl content for this site."}
          </p>
          <div className="mt-4 grid gap-4">
            <DraftReviewField
              label="Business name"
              value={draft.businessName}
              onChange={(value) => updateDraft("businessName", value)}
              meta={fieldMeta.businessName}
              hintId={businessNameHintId}
            />
            <DraftReviewField
              label="Greeting"
              value={draft.greeting}
              onChange={(value) => updateDraft("greeting", value)}
              meta={fieldMeta.greeting}
              hintId={greetingHintId}
              rows={3}
              placeholder="How should the receptionist introduce the business? (draft only)"
            />
            <DraftReviewField
              label="Hours"
              value={draft.hours}
              onChange={(value) => updateDraft("hours", value)}
              meta={fieldMeta.hours}
              hintId={hoursHintId}
              rows={2}
              emptyNote={emptyHoursOrServicesNote("hours", draft.hours)}
            />
            <DraftReviewField
              label="Services"
              value={draft.services}
              onChange={(value) => updateDraft("services", value)}
              meta={fieldMeta.services}
              hintId={servicesHintId}
              rows={3}
              emptyNote={emptyHoursOrServicesNote("services", draft.services)}
            />
            <DraftReviewField
              label="FAQs"
              value={draft.faqs}
              onChange={(value) => updateDraft("faqs", value)}
              meta={fieldMeta.faqs}
              hintId={faqsHintId}
              rows={4}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="submit"
              className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              Preview knowledge pack
            </button>
          </div>
        </form>
      ) : null}

      {step === 4 ? (
        <div>
          {receptionist ? (
            <ReceptionistDraftPreview
              result={receptionist}
              packText={packText}
              promptText={promptText}
              packError={packError}
              onPackTextChange={(value) => {
                setPackText(value);
                try {
                  const parsed: unknown = JSON.parse(value);
                  const pack = normalizeKnowledgePack(parsed);
                  if (!pack) {
                    setPackError(
                      "Knowledge pack JSON was not accepted. Missing fields stay missing; live-call flags cannot be set.",
                    );
                    return;
                  }
                  setPackError(null);
                  setReceptionist({
                    knowledgePack: pack,
                    systemPrompt: finalizeSystemPrompt(promptText),
                    limitations: limitationsFor(pack),
                  });
                } catch {
                  setPackError(
                    "Knowledge pack must be valid JSON. The last accepted pack will be used until this parses.",
                  );
                }
              }}
              onPromptTextChange={(value) => {
                setPromptText(value);
                setReceptionist((current) =>
                  current
                    ? {
                        ...current,
                        systemPrompt: finalizeSystemPrompt(value),
                      }
                    : current,
                );
              }}
              onReset={() => {
                applyBuilt(buildReceptionistDraft(draft));
              }}
            />
          ) : null}
          <p className="mt-6 text-sm text-muted">
            We will store this as a website-to-receptionist early access lead,
            including the knowledge pack and system prompt draft. Submitting
            does not provision a number, place a test call, or send email. If
            the sandbox panel below is enabled, it can use this pack for a
            scripted demo only.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-ink">Website</dt>
              <dd className="break-all text-muted">{businessUrl}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Email</dt>
              <dd className="text-muted">{email}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Reviewed draft</dt>
              <dd>
                <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-border bg-paper p-3 text-xs text-ink">
                  {JSON.stringify(draft, null, 2)}
                </pre>
              </dd>
            </div>
          </dl>
          {error ? (
            <p id={errorId} className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setError(null);
                setStep(3);
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="button"
              disabled={status === "submitting"}
              onClick={() => void onSubmitLead()}
              className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
            >
              {status === "submitting"
                ? "Submitting…"
                : createJourneyNextAction(4)}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Pre-launch only. This is not a live telephony signup. No always-on
            receptionist was created.
          </p>
        </div>
      ) : null}
    </div>
  );
}
