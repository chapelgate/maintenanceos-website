"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { CreateJourneyStepper } from "@/components/CreateJourneyStepper";
import { agentTypeFromRoleSlug } from "@/lib/agent-selection";
import type { AgentType } from "@/lib/agent-blueprint";
import {
  createJourneyNextAction,
  isValidEmail,
  normalisePublicUrl,
  unsafePublicUrlMessage,
  type ReceptionistDraft,
} from "@/lib/onboarding-create-core";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";
import type {
  AgentSandboxQualificationResult,
  AgentSandboxReviewSubject,
} from "@/lib/agent-sandbox-qualification";

const CreateReceptionistLaterSteps = dynamic(
  () =>
    import("@/components/CreateReceptionistLaterSteps").then(
      (module) => module.CreateReceptionistLaterSteps,
    ),
  { ssr: false, loading: CreateLaterStepsFallback },
);

const FIELD_CLASS = "mt-1 w-full rounded-md border border-border px-3 py-2";

const HYDRATION_SUBSCRIBE = () => () => {};
const HYDRATED_CLIENT_SNAPSHOT = () => true;
const HYDRATED_SERVER_SNAPSHOT = () => false;

function presetRoleFromLocation(): AgentType | null {
  if (typeof window === "undefined") return null;
  return agentTypeFromRoleSlug(new URLSearchParams(window.location.search).get("role"));
}

function CreateLaterStepsFallback() {
  const preset = presetRoleFromLocation();
  const step = preset ? 3 : 2;
  return (
    <div
      className="rounded-md border border-border bg-surface p-6 shadow-sm"
      data-lead-type="create_receptionist"
      data-create-step={step}
      data-create-next-action={preset ? "Choose a role" : "Checking…"}
      aria-busy="true"
    >
      <CreateJourneyStepper step={step} headingRef={null} />
      <p className="mb-6 text-sm text-muted">
        Next: {preset ? "Choose a role" : "Checking…"}
      </p>
      <p className="font-medium text-ink">
        {preset ? "Loading the role choice…" : "Loading the website check…"}
      </p>
      <p className="mt-3 text-sm text-muted">
        Your details stay on this page while the next step loads.
      </p>
    </div>
  );
}

/**
 * Claims-safe website→AI-agent early-access flow.
 * Business URL goes in `message` because `website` is the honeypot on submitLead.
 * Steps 2–5 load after the URL check so First Load JS stays the website island.
 */
export function CreateReceptionistForm({
  onDraftChange,
  onReceptionistChange,
  onReviewSubjectChange,
  sandboxQualification,
}: {
  onDraftChange?: (draft: ReceptionistDraft) => void;
  onReceptionistChange?: (built: ReceptionistDraftResult | null) => void;
  onReviewSubjectChange?: (subject: AgentSandboxReviewSubject | null) => void;
  sandboxQualification?: AgentSandboxQualificationResult | null;
} = {}) {
  const hydrated = useSyncExternalStore(
    HYDRATION_SUBSCRIBE,
    HYDRATED_CLIENT_SNAPSHOT,
    HYDRATED_SERVER_SNAPSHOT,
  );
  const [pastWebsite, setPastWebsite] = useState(false);
  const [presetDismissed, setPresetDismissed] = useState(false);
  const [honeypotSuccess, setHoneypotSuccess] = useState(false);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<"businessUrl" | "email" | null>(
    null,
  );
  const [businessUrl, setBusinessUrl] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const errorId = useId();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const businessUrlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const organisationRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const didMountStep = useRef(false);

  useEffect(() => {
    if (!didMountStep.current) {
      didMountStep.current = true;
      return;
    }
    if (pastWebsite) return;
    stepHeadingRef.current?.focus();
  }, [pastWebsite]);

  useEffect(() => {
    if (!presetDismissed) return;
    stepHeadingRef.current?.focus();
  }, [presetDismissed]);

  useEffect(() => {
    if (status !== "error") return;
    if (errorField === "businessUrl") {
      businessUrlRef.current?.focus();
      return;
    }
    if (errorField === "email") {
      emailRef.current?.focus();
    }
  }, [status, error, errorField]);

  function clearError() {
    setError(null);
    setErrorField(null);
  }

  function onStep1() {
    if (!hydrated) return;
    clearError();

    if ((honeypotRef.current?.value ?? "").trim()) {
      setHoneypotSuccess(true);
      return;
    }

    const rawUrl = businessUrlRef.current?.value ?? "";
    const unsafe = unsafePublicUrlMessage(rawUrl);
    if (unsafe) {
      setError(unsafe);
      setErrorField("businessUrl");
      setStatus("error");
      return;
    }
    const nextUrl = normalisePublicUrl(rawUrl);
    if (!nextUrl) {
      setError(
        "Enter a valid public website URL (for example https://example.com).",
      );
      setErrorField("businessUrl");
      setStatus("error");
      return;
    }
    const nextEmail = (emailRef.current?.value ?? "").trim();
    if (!isValidEmail(nextEmail)) {
      setError("Please enter a valid email address.");
      setErrorField("email");
      setStatus("error");
      return;
    }

    setBusinessUrl(nextUrl);
    setEmail(nextEmail);
    setName((nameRef.current?.value ?? "").trim());
    setOrganisation((organisationRef.current?.value ?? "").trim());
    setStatus("idle");
    setPastWebsite(true);
  }

  if (honeypotSuccess) {
    return (
      <div
        className="rounded-md border border-border bg-surface p-6"
        role="status"
      >
        <p className="font-semibold text-ink">You are on the list</p>
        <p className="mt-2 text-sm text-muted">
          Thanks — we recorded your website-to-AI-agent early access request,
          including the draft you reviewed. No live phone number was
          provisioned, no confirmation email was sent, and no live AI agent
          was activated.
        </p>
      </div>
    );
  }

  const presetRole = hydrated ? presetRoleFromLocation() : null;
  const showPreset = Boolean(presetRole) && !presetDismissed && !pastWebsite;

  if (pastWebsite || showPreset) {
    return (
      <CreateReceptionistLaterSteps
        businessUrl={businessUrl}
        email={email}
        name={name}
        organisation={organisation}
        initialStep={presetRole ? 3 : undefined}
        initialAgentType={presetRole}
        onBackToWebsite={() => {
          setStatus("idle");
          clearError();
          if (showPreset) {
            setPresetDismissed(true);
            return;
          }
          setPastWebsite(false);
        }}
        onDraftChange={onDraftChange}
        onReceptionistChange={onReceptionistChange}
        onReviewSubjectChange={onReviewSubjectChange}
        sandboxQualification={sandboxQualification}
      />
    );
  }

  return (
    <div
      className="create-journey-card rounded-md border border-border bg-surface p-6 shadow-sm"
      data-lead-type="create_receptionist"
      data-create-step={1}
      data-create-next-action={createJourneyNextAction(1)}
    >
      <CreateJourneyStepper step={1} headingRef={stepHeadingRef} />
      <p className="mb-6 text-sm text-muted">Next: {createJourneyNextAction(1)}</p>

      <div className="relative overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-ink">
              Business website URL (required)
            </span>
            <input
              ref={businessUrlRef}
              name="businessUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              required
              defaultValue={businessUrl}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || !hydrated) return;
                event.preventDefault();
                onStep1();
              }}
              placeholder="https://your-business.co.uk"
              aria-invalid={errorField === "businessUrl" || undefined}
              aria-describedby={
                errorField === "businessUrl" && error ? errorId : undefined
              }
              className={FIELD_CLASS}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink">Name</span>
            <input
              ref={nameRef}
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
              ref={emailRef}
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email}
              aria-invalid={errorField === "email" || undefined}
              aria-describedby={
                errorField === "email" && error ? errorId : undefined
              }
              className={FIELD_CLASS}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-ink">Organisation</span>
            <input
              ref={organisationRef}
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
              ref={honeypotRef}
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
          type="button"
          disabled={!hydrated}
          data-create-primary-action=""
          data-create-hydrated={hydrated ? "true" : "false"}
          onClick={onStep1}
          className="mt-5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
        >
          {hydrated ? "Check this website" : "Loading form..."}
        </button>
        <p className="mt-3 text-xs text-muted">
          Website learning reads only a small, bounded set of public pages.
          Checking the website does not place a telephone call or create a live
          public phone number.
        </p>
      </div>
    </div>
  );
}
