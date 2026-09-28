"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { AgentCustomerConfiguration } from "@/components/AgentCustomerConfiguration";
import { AgentReviewGate } from "@/components/AgentReviewGate";
import { AgentTypeSelector } from "@/components/AgentTypeSelector";
import { CreateJourneyStepper } from "@/components/CreateJourneyStepper";
import { siteConfig } from "@/config/site";
import {
  agentReviewRevision,
  applyReviewedIdentityToAgentBlueprint,
  buildAgentReviewRecord,
  buildAgentReviewRequirements,
  finalizeAgentReview,
  reviewFactHint,
  type ReviewedIdentityDraft,
} from "@/lib/agent-review";
import {
  applyCustomerAgentConfiguration,
  customerConfigurationForBlueprint,
  type CustomerAgentConfiguration,
} from "@/lib/agent-customer-configuration";
import { submitLead } from "@/lib/lead-adapter";
import { createAgentBlueprintDraft } from "@/lib/agent-selection";
import type { AgentBlueprintV1, AgentType } from "@/lib/agent-blueprint";
import {
  EMPTY_RECEPTIONIST_DRAFT,
  createJourneyNextAction,
  isCreateScanReady,
  type CreateJourneyStep,
  type CreateScanProgress,
  type ReceptionistDraft,
} from "@/lib/onboarding-create-core";
import {
  buildCreateLeadMessage,
  createScanProgressTitle,
  emptyHoursOrServicesNote,
  hostnameBusinessHint,
  requestOnboardingScan,
  scanFieldReviewHint,
  type DraftFieldMeta,
  type ScanBusinessFacts,
  type ScanBusinessFactMeta,
  type ScanDraftFieldMeta,
} from "@/lib/onboarding-create";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";
import {
  qualificationMatchesReview,
  type AgentSandboxQualificationResult,
  type AgentSandboxReviewSubject,
} from "@/lib/agent-sandbox-qualification";

const ReceptionistDraftPreview = dynamic(
  () =>
    import("@/components/ReceptionistDraftPreview").then(
      (module) => module.ReceptionistDraftPreview,
    ),
  { ssr: false },
);

function loadReceptionistDraft() {
  return import("@/lib/receptionist-draft");
}

function loadAgentConfiguration() {
  return import("@/lib/agent-configuration");
}

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_IDENTITY_REVIEW: ReviewedIdentityDraft = {
  locations: "",
  phone: "",
  email: "",
};

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
  hint: explicitHint,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  meta?: DraftFieldMeta;
  hintId: string;
  rows?: number;
  placeholder?: string;
  emptyNote?: string | null;
  hint?: string | null;
  readOnly?: boolean;
}) {
  const hint = emptyNote || explicitHint || scanFieldReviewHint(meta, value);
  const describedBy = hint ? hintId : undefined;
  const empty = !value.trim() && Boolean(emptyNote);
  const fieldClass = empty ? `${FIELD_CLASS} border-dashed` : FIELD_CLASS;
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink">
        {label}
        {empty ? (
          <span className="ml-2 font-normal text-muted">Empty — not on file</span>
        ) : null}
      </span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={
            readOnly || !onChange ? undefined : (e) => onChange(e.target.value)
          }
          placeholder={placeholder}
          aria-describedby={describedBy}
          readOnly={readOnly}
          className={fieldClass}
        />
      ) : (
        <input
          value={value}
          onChange={
            readOnly || !onChange ? undefined : (e) => onChange(e.target.value)
          }
          aria-describedby={describedBy}
          readOnly={readOnly}
          className={fieldClass}
        />
      )}
      {hint ? (
        <p
          id={hintId}
          className="mt-1 text-xs text-muted"
          data-empty-field={empty || undefined}
        >
          {hint}
        </p>
      ) : null}
    </label>
  );
}

/**
 * Steps 2–5 of /create. Loaded after the URL/email island so First Load JS
 * does not include scan, pack preview, or lead-submit code.
 */
export function CreateReceptionistLaterSteps({
  businessUrl,
  email,
  name,
  organisation,
  onBackToWebsite,
  onDraftChange,
  onReceptionistChange,
  onReviewSubjectChange,
  sandboxQualification,
}: {
  businessUrl: string;
  email: string;
  name: string;
  organisation: string;
  onBackToWebsite: () => void;
  onDraftChange?: (draft: ReceptionistDraft) => void;
  onReceptionistChange?: (built: ReceptionistDraftResult | null) => void;
  onReviewSubjectChange?: (subject: AgentSandboxReviewSubject | null) => void;
  sandboxQualification?: AgentSandboxQualificationResult | null;
}) {
  const [step, setStep] = useState<CreateJourneyStep>(2);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<CreateScanProgress>("checking");
  const [scanDetail, setScanDetail] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReceptionistDraft>(EMPTY_RECEPTIONIST_DRAFT);
  const [fieldMeta, setFieldMeta] = useState<ScanDraftFieldMeta>({});
  const [factMeta, setFactMeta] = useState<ScanBusinessFactMeta>({});
  const [facts, setFacts] = useState<ScanBusinessFacts>({});
  const [identityReview, setIdentityReview] =
    useState<ReviewedIdentityDraft>(EMPTY_IDENTITY_REVIEW);
  const [reviewConfirmedIds, setReviewConfirmedIds] = useState<string[]>([]);
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);
  const [agentBlueprint, setAgentBlueprint] = useState<AgentBlueprintV1 | null>(null);
  const [customerConfiguration, setCustomerConfiguration] =
    useState<CustomerAgentConfiguration | null>(null);
  const [agentSelectionError, setAgentSelectionError] = useState<string | null>(null);
  const [receptionist, setReceptionist] = useState<ReceptionistDraftResult | null>(
    null,
  );
  const [packText, setPackText] = useState("");
  const [promptText, setPromptText] = useState("");
  const [packError, setPackError] = useState<string | null>(null);
  const [configEditPending, setConfigEditPending] = useState(false);
  const errorId = useId();
  const progressId = useId();
  const businessNameHintId = useId();
  const greetingHintId = useId();
  const hoursHintId = useId();
  const servicesHintId = useId();
  const faqsHintId = useId();
  const websiteHintId = useId();
  const locationsHintId = useId();
  const phoneHintId = useId();
  const emailHintId = useId();
  const reviewStatusId = useId();
  const configEditVersionRef = useRef(0);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    onReceptionistChange?.(receptionist);
  }, [receptionist, onReceptionistChange]);

  useEffect(() => {
    if (!onReviewSubjectChange) return;
    if (
      configEditPending ||
      packError ||
      !agentBlueprint ||
      !receptionist
    ) {
      onReviewSubjectChange(null);
      return;
    }
    try {
      const requirements = buildAgentReviewRequirements({
        blueprint: agentBlueprint,
        factMeta,
        fieldMeta,
        missing: receptionist.knowledgePack.missing,
      });
      const revisionId = agentReviewRevision({
        blueprint: agentBlueprint,
        knowledgePack: receptionist.knowledgePack,
        systemPrompt: receptionist.systemPrompt,
        factMeta,
        fieldMeta,
        missing: receptionist.knowledgePack.missing,
      });
      const reviewRecord = buildAgentReviewRecord(
        requirements,
        reviewConfirmedIds,
        revisionId,
      );
      if (!reviewRecord.complete) {
        onReviewSubjectChange(null);
        return;
      }
      onReviewSubjectChange({
        blueprint: agentBlueprint,
        knowledgePack: receptionist.knowledgePack,
        systemPrompt: receptionist.systemPrompt,
        factMeta,
        fieldMeta,
        missing: receptionist.knowledgePack.missing,
        reviewRecord,
      });
    } catch {
      onReviewSubjectChange(null);
    }
  }, [
    agentBlueprint,
    configEditPending,
    factMeta,
    fieldMeta,
    onReviewSubjectChange,
    packError,
    receptionist,
    reviewConfirmedIds,
  ]);

  function applyBuilt(built: ReceptionistDraftResult) {
    setReceptionist(built);
    setPackText(JSON.stringify(built.knowledgePack, null, 2));
    setPromptText(built.systemPrompt);
    setPackError(null);
  }

  useEffect(() => {
    if (step < 4) return;
    void loadReceptionistDraft();
    void loadAgentConfiguration();
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;

    (async () => {
      setProgress("checking");
      setScanDetail(null);
      setFacts({});
      setFactMeta({});
      setIdentityReview(EMPTY_IDENTITY_REVIEW);
      setReviewConfirmedIds([]);
      setSelectedAgentType(null);
      setAgentBlueprint(null);
      setCustomerConfiguration(null);
      setAgentSelectionError(null);
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (cancelled) return;

      const endpoint = siteConfig.onboardingScanEndpoint.trim();
      if (!endpoint) {
        setDraft({
          ...EMPTY_RECEPTIONIST_DRAFT,
          businessName: hostnameBusinessHint(businessUrl),
        });
        setFieldMeta({});
        setFactMeta({});
        setFacts({});
        setIdentityReview(EMPTY_IDENTITY_REVIEW);
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
        setFactMeta(outcome.factMeta);
        setFacts(outcome.facts);
        setIdentityReview({
          locations: outcome.facts.locations?.join("\n") ?? "",
          phone: outcome.facts.contact?.phones?.[0] ?? "",
          email: outcome.facts.contact?.emails?.[0] ?? "",
        });
        setProgress(filled ? "scanned" : "scanned_empty");
        return;
      }
      if (outcome.status === "disabled") {
        setDraft({
          ...EMPTY_RECEPTIONIST_DRAFT,
          businessName: hostnameBusinessHint(businessUrl),
        });
        setFieldMeta({});
        setFactMeta({});
        setFacts({});
        setIdentityReview(EMPTY_IDENTITY_REVIEW);
        setProgress("queued");
        return;
      }
      setDraft(EMPTY_RECEPTIONIST_DRAFT);
      setFieldMeta({});
      setFactMeta({});
      setFacts({});
      setIdentityReview(EMPTY_IDENTITY_REVIEW);
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
    configEditVersionRef.current += 1;
    setConfigEditPending(false);
    setReviewConfirmedIds([]);
    setFieldMeta((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setFactMeta((current) => {
      const next = { ...current };
      if (key === "businessName") delete next.businessName;
      if (key === "hours") delete next.hours;
      if (key === "services") delete next.services;
      if (key === "faqs") delete next.faqs;
      return next;
    });
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateIdentityReview<K extends keyof ReviewedIdentityDraft>(
    key: K,
    value: string,
  ) {
    configEditVersionRef.current += 1;
    setConfigEditPending(false);
    setReviewConfirmedIds([]);
    setFactMeta((current) => {
      const next = { ...current };
      if (key === "locations") delete next.locations;
      if (key === "phone" || key === "email") delete next.contact;
      return next;
    });
    setIdentityReview((current) => ({ ...current, [key]: value }));
  }

  function currentReview() {
    if (!agentBlueprint || !receptionist) return null;
    const requirements = buildAgentReviewRequirements({
      blueprint: agentBlueprint,
      factMeta,
      fieldMeta,
      missing: receptionist.knowledgePack.missing,
    });
    const revisionId = agentReviewRevision({
      blueprint: agentBlueprint,
      knowledgePack: receptionist.knowledgePack,
      systemPrompt: receptionist.systemPrompt,
      factMeta,
      fieldMeta,
      missing: receptionist.knowledgePack.missing,
    });
    return {
      requirements,
      record: buildAgentReviewRecord(
        requirements,
        reviewConfirmedIds,
        revisionId,
      ),
    };
  }

  function clearError() {
    setError(null);
  }

  async function onSubmitLead() {
    clearError();
    if (configEditPending) {
      setError("Finish applying the latest configuration edit before submitting.");
      setStatus("error");
      return;
    }
    if (packError) {
      setError("Fix the knowledge pack JSON before submitting this configuration.");
      setStatus("error");
      return;
    }
    const currentBlueprint = agentBlueprint;
    const currentReceptionist = receptionist;
    if (!currentBlueprint || !currentReceptionist) {
      setError(
        "The generated AI configuration is missing. Generate it again before submitting.",
      );
      setStatus("error");
      return;
    }
    const review = currentReview();
    if (!review || !review.record.complete) {
      setError(
        "Complete every required review confirmation before submitting this configuration.",
      );
      setStatus("error");
      return;
    }
    let reviewedBlueprint: AgentBlueprintV1;
    try {
      reviewedBlueprint = finalizeAgentReview({
        blueprint: currentBlueprint,
        knowledgePack: currentReceptionist.knowledgePack,
        systemPrompt: currentReceptionist.systemPrompt,
        factMeta,
        fieldMeta,
        missing: currentReceptionist.knowledgePack.missing,
        record: review.record,
      });
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "The customer review could not be finalised safely.",
      );
      setStatus("error");
      return;
    }

    const qualificationRequired = siteConfig.sandboxTestCallEnabled;
    if (
      qualificationRequired &&
      !qualificationMatchesReview(
        sandboxQualification,
        review.record.revisionId,
        reviewedBlueprint,
      )
    ) {
      setError(
        "Run sandbox qualification for this exact reviewed configuration before submitting.",
      );
      setStatus("error");
      return;
    }
    const submissionBlueprint = qualificationRequired
      ? sandboxQualification!.blueprint
      : reviewedBlueprint;

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
        factMeta,
        review: review.record,
        sandboxQualification: siteConfig.sandboxTestCallEnabled
          ? sandboxQualification?.record
          : undefined,
        agentBlueprint: submissionBlueprint,
        receptionist: currentReceptionist,
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
          Thanks — we recorded your website-to-AI-agent early access request,
          including the role and draft you reviewed. No live phone number was
          provisioned, no confirmation email was sent, and no live agent was
          activated.
        </p>
      </div>
    );
  }

  const stepReady = isCreateScanReady(progress);
  const nextAction = createJourneyNextAction(step, progress);
  const review = currentReview();

  return (
    <div
      className="create-journey-card rounded-md border border-border bg-surface p-6 shadow-sm"
      data-lead-type="create_receptionist"
      data-create-step={step}
      data-create-next-action={nextAction}
    >
      <CreateJourneyStepper step={step} headingRef={stepHeadingRef} />
      <p className="mb-6 text-sm text-muted">
        Next: {nextAction}
        {step === 5
          ? ". Optional scripted sandbox demo is below when the local flag is on — not a live phone."
          : null}
      </p>

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
                clearError();
                onBackToWebsite();
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!stepReady}
              aria-describedby={progressId}
              data-create-primary-action=""
              onClick={() => {
                setStatus("idle");
                clearError();
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
            clearError();
            setAgentSelectionError(null);
            if (!selectedAgentType) {
              setAgentSelectionError("Choose one agent role to continue.");
              return;
            }
            try {
              const blueprint = createAgentBlueprintDraft({
                type: selectedAgentType,
                businessName: draft.businessName || hostnameBusinessHint(businessUrl),
                businessUrl,
                facts,
              });
              setAgentBlueprint(blueprint);
              setCustomerConfiguration(
                customerConfigurationForBlueprint(blueprint),
              );
              setStep(4);
            } catch (selectionError) {
              setAgentBlueprint(null);
              setAgentSelectionError(
                selectionError instanceof Error
                  ? selectionError.message
                  : "The selected agent could not be prepared safely.",
              );
            }
          }}
        >
          <AgentTypeSelector
            selected={selectedAgentType}
            onSelect={(type) => {
              setSelectedAgentType(type);
              setAgentBlueprint(null);
              setCustomerConfiguration(null);
              setReviewConfirmedIds([]);
              setAgentSelectionError(null);
            }}
          />
          {agentSelectionError ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {agentSelectionError}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setAgentSelectionError(null);
                setStep(2);
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!selectedAgentType}
              data-create-primary-action=""
              className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
            >
              Configure agent
            </button>
          </div>
        </form>
      ) : null}

      {step === 4 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const editVersion = ++configEditVersionRef.current;
            setConfigEditPending(true);
            setStatus("idle");
            clearError();
            if (!agentBlueprint || !customerConfiguration) {
              setConfigEditPending(false);
              setError(
                "Agent configuration is missing. Choose the agent role again.",
              );
              return;
            }
            void loadAgentConfiguration()
              .then(({ buildAgentConfiguration }) => {
                if (editVersion !== configEditVersionRef.current) return;
                try {
                  const configuredBlueprint = applyCustomerAgentConfiguration(
                    agentBlueprint,
                    customerConfiguration,
                  );
                  const identityBlueprint = applyReviewedIdentityToAgentBlueprint(
                    configuredBlueprint,
                    identityReview,
                  );
                  const configuration = buildAgentConfiguration({
                    blueprint: identityBlueprint,
                    reviewedDraft: draft,
                  });
                  if (editVersion !== configEditVersionRef.current) return;
                  setReviewConfirmedIds([]);
                  setAgentBlueprint(configuration.blueprint);
                  applyBuilt(configuration);
                  setConfigEditPending(false);
                  setStep(5);
                } catch (configurationError) {
                  setConfigEditPending(false);
                  setError(
                    configurationError instanceof Error
                      ? configurationError.message
                      : "The AI configuration could not be generated safely.",
                  );
                }
              })
              .catch(() => {
                if (editVersion !== configEditVersionRef.current) return;
                setConfigEditPending(false);
                setError(
                  "The AI configuration module could not be loaded safely. No generated configuration was accepted.",
                );
              });
          }}
        >
          <p className="text-sm text-muted">
            Configure the selected role, then review the business information
            that will be used to generate the final pack. Voice is stored as a
            preference only; this website step cannot alter a live phone line.
          </p>
          {agentBlueprint && customerConfiguration ? (
            <div className="mt-5">
              <AgentCustomerConfiguration
                blueprint={agentBlueprint}
                configuration={customerConfiguration}
                onChange={(configuration) => {
                  configEditVersionRef.current += 1;
                  setConfigEditPending(false);
                  setStatus("idle");
                  setReviewConfirmedIds([]);
                  setCustomerConfiguration(configuration);
                }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-red-700" role="alert">
              Agent configuration is unavailable. Go back and choose the role
              again.
            </p>
          )}
          <p className="mt-5 text-sm text-muted">
            {progress === "scanned"
              ? "Edit anything the scan returned. Empty fields were not invented. Where the scan copied a value, a source and confidence hint appears under that field."
              : progress === "queued"
                ? "These fields are a draft for early access. The business name is from your website address, not from a crawl."
                : "Complete what you can. We did not invent crawl content for this site."}
          </p>
          {error ? (
            <p id={errorId} className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 grid gap-4">
            <DraftReviewField
              label="Website"
              value={facts.website ?? businessUrl}
              hintId={websiteHintId}
              hint={reviewFactHint(
                factMeta.website,
                Boolean((facts.website ?? businessUrl).trim()),
              )}
              readOnly
            />
            <DraftReviewField
              label="Business name"
              value={draft.businessName}
              onChange={(value) => updateDraft("businessName", value)}
              meta={fieldMeta.businessName}
              hintId={businessNameHintId}
              hint={reviewFactHint(
                fieldMeta.businessName,
                Boolean(draft.businessName.trim()),
              )}
            />
            <DraftReviewField
              label="Greeting"
              value={draft.greeting}
              onChange={(value) => updateDraft("greeting", value)}
              meta={fieldMeta.greeting}
              hintId={greetingHintId}
              hint={reviewFactHint(
                fieldMeta.greeting,
                Boolean(draft.greeting.trim()),
              )}
              rows={3}
              placeholder="How should the AI agent introduce the business? (draft only)"
            />
            <DraftReviewField
              label="Locations"
              value={identityReview.locations}
              onChange={(value) => updateIdentityReview("locations", value)}
              hintId={locationsHintId}
              hint={reviewFactHint(
                factMeta.locations,
                Boolean(identityReview.locations.trim()),
              )}
              rows={3}
              emptyNote={
                identityReview.locations.trim()
                  ? null
                  : "Empty — not on file. Locations were not invented."
              }
            />
            <DraftReviewField
              label="Phone"
              value={identityReview.phone}
              onChange={(value) => updateIdentityReview("phone", value)}
              hintId={phoneHintId}
              hint={reviewFactHint(
                factMeta.contact,
                Boolean(identityReview.phone.trim()),
              )}
            />
            <DraftReviewField
              label="Contact email"
              value={identityReview.email}
              onChange={(value) => updateIdentityReview("email", value)}
              hintId={emailHintId}
              hint={reviewFactHint(
                factMeta.contact,
                Boolean(identityReview.email.trim()),
              )}
            />
            <DraftReviewField
              label="Hours"
              value={draft.hours}
              onChange={(value) => updateDraft("hours", value)}
              meta={fieldMeta.hours}
              hintId={hoursHintId}
              hint={reviewFactHint(
                fieldMeta.hours,
                Boolean(draft.hours.trim()),
              )}
              rows={2}
              emptyNote={emptyHoursOrServicesNote("hours", draft.hours)}
            />
            <DraftReviewField
              label="Services"
              value={draft.services}
              onChange={(value) => updateDraft("services", value)}
              meta={fieldMeta.services}
              hintId={servicesHintId}
              hint={reviewFactHint(
                fieldMeta.services,
                Boolean(draft.services.trim()),
              )}
              rows={3}
              emptyNote={emptyHoursOrServicesNote("services", draft.services)}
            />
            <DraftReviewField
              label="FAQs"
              value={draft.faqs}
              onChange={(value) => updateDraft("faqs", value)}
              meta={fieldMeta.faqs}
              hintId={faqsHintId}
              hint={reviewFactHint(
                fieldMeta.faqs,
                Boolean(draft.faqs.trim()),
              )}
              rows={4}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                configEditVersionRef.current += 1;
                setConfigEditPending(false);
                setStep(3);
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={configEditPending}
              data-create-primary-action=""
              className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
            >
              {configEditPending ? "Generating…" : "Generate reviewed configuration"}
            </button>
          </div>
        </form>
      ) : null}

      {step === 5 ? (
        <div>
          {receptionist ? (
            <ReceptionistDraftPreview
              result={receptionist}
              packText={packText}
              promptText={promptText}
              packError={packError}
              onPackTextChange={(value) => {
                const editVersion = ++configEditVersionRef.current;
                setConfigEditPending(true);
                setReviewConfirmedIds([]);
                setPackText(value);
                if (!agentBlueprint) {
                  setConfigEditPending(false);
                  setPackError(
                    "Agent control blueprint is missing. Pack edits cannot be accepted safely.",
                  );
                  return;
                }
                void Promise.all([
                  loadReceptionistDraft(),
                  loadAgentConfiguration(),
                ]).then(([draftLib, configurationLib]) => {
                  if (editVersion !== configEditVersionRef.current) return;
                  try {
                    const parsed: unknown = JSON.parse(value);
                    const pack = draftLib.normalizeKnowledgePack(parsed);
                    if (!pack) {
                      setReviewConfirmedIds([]);
                      setConfigEditPending(false);
                      setPackError(
                        "Knowledge pack JSON was not accepted. Missing fields stay missing; live-call flags cannot be set.",
                      );
                      return;
                    }
                    const nextBlueprint =
                      configurationLib.applyKnowledgePackToAgentBlueprint(
                        agentBlueprint,
                        pack,
                      );
                    const regeneratedPrompt =
                      configurationLib.buildAgentSystemPrompt(
                        nextBlueprint,
                        pack,
                      );
                    if (editVersion !== configEditVersionRef.current) return;
                    setReviewConfirmedIds([]);
                    setPackError(null);
                    // Raw pack edits replace draft-field values. Preserve only
                    // structured provenance for identity facts the pack cannot edit.
                    setFieldMeta({});
                    setFactMeta((current) => {
                      const next: ScanBusinessFactMeta = {};
                      if (current.website) next.website = current.website;
                      if (current.locations) next.locations = current.locations;
                      if (current.contact) next.contact = current.contact;
                      return next;
                    });
                    setAgentBlueprint(nextBlueprint);
                    setPromptText(regeneratedPrompt);
                    setReceptionist({
                      knowledgePack: pack,
                      systemPrompt: regeneratedPrompt,
                      limitations: configurationLib.agentLimitationsFor(pack),
                    });
                    setConfigEditPending(false);
                  } catch {
                    setReviewConfirmedIds([]);
                    setConfigEditPending(false);
                    setPackError(
                      "Knowledge pack must be valid JSON. The last accepted pack will be used until this parses.",
                    );
                  }
                }).catch(() => {
                  if (editVersion !== configEditVersionRef.current) return;
                  setReviewConfirmedIds([]);
                  setConfigEditPending(false);
                  setPackError(
                    "The knowledge-pack controls could not be loaded safely. The previous stored configuration was retained.",
                  );
                });
              }}
              onPromptTextChange={(value) => {
                const editVersion = ++configEditVersionRef.current;
                setConfigEditPending(true);
                setReviewConfirmedIds([]);
                setPromptText(value);
                if (!agentBlueprint) {
                  setConfigEditPending(false);
                  return;
                }
                void loadAgentConfiguration().then(
                  ({ finalizeAgentSystemPrompt }) => {
                    if (editVersion !== configEditVersionRef.current) return;
                    setReviewConfirmedIds([]);
                    setReceptionist((current) =>
                      current
                        ? {
                            ...current,
                            systemPrompt: finalizeAgentSystemPrompt(
                              value,
                              agentBlueprint,
                            ),
                          }
                        : current,
                    );
                    setConfigEditPending(false);
                  },
                ).catch(() => {
                  if (editVersion !== configEditVersionRef.current) return;
                  setReviewConfirmedIds([]);
                  setConfigEditPending(false);
                  setPromptText(receptionist?.systemPrompt ?? "");
                  setError(
                    "The prompt edit could not be applied safely. The previous stored configuration was retained.",
                  );
                });
              }}
              onReset={() => {
                const editVersion = ++configEditVersionRef.current;
                setConfigEditPending(true);
                setReviewConfirmedIds([]);
                if (!agentBlueprint) {
                  setConfigEditPending(false);
                  setPackError(
                    "Agent control blueprint is missing. Configuration cannot be reset safely.",
                  );
                  return;
                }
                void loadAgentConfiguration().then(({ buildAgentConfiguration }) => {
                  if (editVersion !== configEditVersionRef.current) return;
                  const configuration = buildAgentConfiguration({
                    blueprint: agentBlueprint,
                    reviewedDraft: draft,
                  });
                  setReviewConfirmedIds([]);
                  setAgentBlueprint(configuration.blueprint);
                  applyBuilt(configuration);
                  setConfigEditPending(false);
                }).catch(() => {
                  if (editVersion !== configEditVersionRef.current) return;
                  setReviewConfirmedIds([]);
                  setConfigEditPending(false);
                  setError(
                    "The configuration reset could not be applied safely. The previous stored configuration was retained.",
                  );
                });
              }}
            />
          ) : null}
          <p className="mt-6 text-sm text-muted">
            We will store this as a website-to-AI-agent early access lead,
            including the selected AgentBlueprint, knowledge pack and system
            prompt draft. Submitting does not provision a number, place a test
            call, or send email. If
            the sandbox panel below is enabled, it can use this pack for a
            scripted demo only.
          </p>
          {agentBlueprint && review ? (
            <div className="mt-5">
              <AgentReviewGate
                blueprint={agentBlueprint}
                requirements={review.requirements}
                confirmedIds={reviewConfirmedIds}
                disabled={configEditPending}
                onToggle={(id, checked) => {
                  clearError();
                  setReviewConfirmedIds((current) => {
                    if (checked) return [...new Set([...current, id])];
                    return current.filter((item) => item !== id);
                  });
                }}
              />
            </div>
          ) : null}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-ink">Website reviewed</dt>
              <dd className="break-all text-muted">{businessUrl}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Early-access email</dt>
              <dd className="break-all text-muted">{email}</dd>
            </div>
          </dl>
          <p id={reviewStatusId} className="mt-3 text-sm text-muted">
            {configEditPending
              ? "Applying the latest configuration edit…"
              : review
                ? review.record.complete
                  ? siteConfig.sandboxTestCallEnabled
                    ? qualificationMatchesReview(
                        sandboxQualification,
                        review.record.revisionId,
                      )
                      ? "Customer review and sandbox qualification are complete."
                      : "Customer review is complete. Run sandbox qualification below before submitting."
                    : "All required customer-review confirmations are complete."
                  : `${review.record.missingIds.length} required review confirmation(s) remain.`
                : "The customer review record is not ready."}
          </p>
          {error ? (
            <p id={errorId} className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                configEditVersionRef.current += 1;
                setConfigEditPending(false);
                setReviewConfirmedIds([]);
                setStatus("idle");
                clearError();
                setStep(4);
              }}
              className="inline-flex min-h-6 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
            >
              Back
            </button>
            <button
              type="button"
              disabled={
                status === "submitting" ||
                configEditPending ||
                Boolean(packError) ||
                !review?.record.complete ||
                (siteConfig.sandboxTestCallEnabled &&
                  !qualificationMatchesReview(
                    sandboxQualification,
                    review?.record.revisionId ?? "",
                  ))
              }
              aria-describedby={reviewStatusId}
              data-create-primary-action=""
              onClick={() => void onSubmitLead()}
              className="inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
            >
              {status === "submitting"
                ? "Submitting…"
                : createJourneyNextAction(5)}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Pre-launch only. This is not a live telephony signup. No live AI
            agent was activated.
          </p>
        </div>
      ) : null}
    </div>
  );
}
