"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { CreateJourneyStepper } from "@/components/CreateJourneyStepper";
import {
  createJourneyNextAction,
  isValidEmail,
  normalisePublicUrl,
  type ReceptionistDraft,
} from "@/lib/onboarding-create-core";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";

const CreateReceptionistLaterSteps = dynamic(
  () =>
    import("@/components/CreateReceptionistLaterSteps").then(
      (module) => module.CreateReceptionistLaterSteps,
    ),
  { ssr: false, loading: CreateLaterStepsFallback },
);

function loadLaterSteps() {
  return import("@/components/CreateReceptionistLaterSteps");
}

const FIELD_CLASS = "mt-1 w-full rounded-md border border-border px-3 py-2";

function CreateLaterStepsFallback() {
  return (
    <div
      className="create-journey-card rounded-md border border-border bg-surface p-6 shadow-sm"
      data-lead-type="create_receptionist"
      data-create-step={2}
      data-create-next-action="Checking…"
    >
      <CreateJourneyStepper step={2} headingRef={null} />
      <p className="mb-6 text-sm text-muted">Next: Checking…</p>
      <p className="font-medium text-ink">Checking URL…</p>
      <p className="mt-3 text-sm text-muted">
        We only accept a public website address here. Private or internal hosts
        are not fetched from this page.
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
}: {
  onDraftChange?: (draft: ReceptionistDraft) => void;
  onReceptionistChange?: (built: ReceptionistDraftResult | null) => void;
} = {}) {
  const [pastWebsite, setPastWebsite] = useState(false);
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
  const emailRef = useRef<HTMLInputElement>(null);
  const didMountStep = useRef(false);

  useEffect(() => {
    void loadLaterSteps();
  }, []);

  useEffect(() => {
    if (!didMountStep.current) {
      didMountStep.current = true;
      return;
    }
    if (pastWebsite) return;
    stepHeadingRef.current?.focus();
  }, [pastWebsite]);

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

  function onStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    const fd = new FormData(e.currentTarget);

    if (String(fd.get("website") ?? "").trim()) {
      setHoneypotSuccess(true);
      return;
    }

    const nextUrl = normalisePublicUrl(String(fd.get("businessUrl") ?? ""));
    if (!nextUrl) {
      setError(
        "Enter a valid public website URL (for example https://example.com).",
      );
      setErrorField("businessUrl");
      setStatus("error");
      return;
    }
    const nextEmail = String(fd.get("email") ?? "").trim();
    if (!isValidEmail(nextEmail)) {
      setError("Please enter a valid email address.");
      setErrorField("email");
      setStatus("error");
      return;
    }

    setBusinessUrl(nextUrl);
    setEmail(nextEmail);
    setName(String(fd.get("name") ?? "").trim());
    setOrganisation(String(fd.get("organisation") ?? "").trim());
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

  if (pastWebsite) {
    return (
      <CreateReceptionistLaterSteps
        businessUrl={businessUrl}
        email={email}
        name={name}
        organisation={organisation}
        onBackToWebsite={() => {
          setStatus("idle");
          clearError();
          setPastWebsite(false);
        }}
        onDraftChange={onDraftChange}
        onReceptionistChange={onReceptionistChange}
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

      <form onSubmit={onStep1} noValidate className="relative overflow-hidden">
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
          data-create-primary-action=""
          className="mt-5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
        >
          Check this website
        </button>
        <p className="mt-3 text-xs text-muted">
          Pre-launch capture only. Checking this website does not scan a live
          phone line and does not create a receptionist.
        </p>
      </form>
    </div>
  );
}
