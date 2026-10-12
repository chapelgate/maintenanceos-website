"use client";

import { FormEvent, useId, useRef, useState } from "react";
import type { LeadType } from "@/config/site";
import { siteConfig } from "@/config/site";
import { EnquiryUnavailable } from "@/components/EnquiryUnavailable";
import { submitLead, type LeadSuccessMode } from "@/lib/lead-adapter";
import { trackWebsiteEvent } from "@/lib/measurement";

type LeadCaptureFormProps = {
  leadType: LeadType;
  title?: string;
  helper?: string;
  submitLabel?: string;
  showMessage?: boolean;
  showOrganisation?: boolean;
  id?: string;
};

function successCopy(mode: LeadSuccessMode): { title: string; body: string } {
  // Success copy distinguishes local stubs from provider-accepted confirmation email.
  if (mode === "local_stub") {
    return {
      title: "Thank you",
      body: "Your details have been recorded locally for this session. A form endpoint is not configured yet, so no email was sent. We will connect a lead queue before launch.",
    };
  }
  if (mode === "queued_stub") {
    return {
      title: "Thank you",
      body: "Your details were stored by the local form stub. No email was sent, and nobody has been notified yet.",
    };
  }
  return {
    title: "Thank you",
    body: "Your request was accepted into the lead queue and a confirmation email was accepted by the mail provider. We will be in touch.",
  };
}

export function LeadCaptureForm({
  leadType,
  title,
  helper,
  submitLabel = "Submit",
  showMessage = false,
  showOrganisation = true,
  id,
}: LeadCaptureFormProps) {
  if (!siteConfig.formEndpoint.trim()) {
    return <EnquiryUnavailable id={id} title={title} helper={helper} />;
  }

  return (
    <LeadCaptureFormFields
      leadType={leadType}
      title={title}
      helper={helper}
      submitLabel={submitLabel}
      showMessage={showMessage}
      showOrganisation={showOrganisation}
      id={id}
    />
  );
}

function LeadCaptureFormFields({
  leadType,
  title,
  helper,
  submitLabel = "Submit",
  showMessage = false,
  showOrganisation = true,
  id,
}: LeadCaptureFormProps) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [successMode, setSuccessMode] =
    useState<LeadSuccessMode>("local_stub");
  const [error, setError] = useState<string | null>(null);
  const [receiptReference, setReceiptReference] = useState<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const errorId = useId();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const website = String(fd.get("website") ?? "");
    if (!website) {
      trackWebsiteEvent({ event: "form_submit_start", leadType });
    }
    if (!website && !submissionIdRef.current) {
      submissionIdRef.current =
        globalThis.crypto?.randomUUID?.() ??
        `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    }
    const result = await submitLead({
      leadType,
      email: String(fd.get("email") ?? ""),
      name: String(fd.get("name") ?? ""),
      organisation: String(fd.get("organisation") ?? ""),
      role: String(fd.get("role") ?? ""),
      message: String(fd.get("message") ?? ""),
      website,
      submissionId: submissionIdRef.current ?? undefined,
    });
    if (!result.ok) {
      if (!website) {
        trackWebsiteEvent({ event: "form_submit_error", leadType });
      }
      setError(
        result.error ||
          "We could not submit just now. Please try again shortly.",
      );
      setStatus("error");
      return;
    }
    if (
      !website &&
      result.mode === "accepted" &&
      (!result.reference || result.confirmationEmail !== "accepted")
    ) {
      trackWebsiteEvent({ event: "form_submit_error", leadType });
      setError(
        "Your request reached the server, but a complete receipt and confirmation-email acknowledgement were not returned. Please retry.",
      );
      setStatus("error");
      return;
    }
    if (!website) {
      trackWebsiteEvent({ event: "form_submit_success", leadType });
    }
    setReceiptReference(result.reference ?? null);
    setSuccessMode(result.mode);
    setStatus("success");
    form.reset();
  }

  if (status === "success") {
    const copy = successCopy(successMode);
    return (
      <div
        id={id}
        className="rounded-md border border-border bg-surface p-6"
        role="status"
        data-lead-success={successMode}
      >
        <p className="font-semibold text-ink">{copy.title}</p>
        <p className="mt-2 text-sm text-muted">{copy.body}</p>
        {receiptReference ? (
          <p className="mt-3 text-sm font-medium text-ink">
            Reference: <span className="font-mono">{receiptReference}</span>
          </p>
        ) : null}
      </div>
    );
  }

  const emailInvalid = status === "error" && Boolean(error);

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-md border border-border bg-surface p-6 shadow-sm"
      noValidate
      data-lead-type={leadType}
    >
      {title ? (
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      ) : null}
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
      <p className="mt-2 text-xs text-muted">Only email is required. Everything else is optional.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Name (optional)</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Email (required)</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid ? errorId : undefined}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        {showOrganisation ? (
          <label className="block text-sm">
            <span className="font-medium text-ink">Organisation (optional)</span>
            <input
              name="organisation"
              type="text"
              autoComplete="organization"
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="font-medium text-ink">Role (optional)</span>
          <select
            name="role"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="landlord">Landlord</option>
            <option value="letting_agent">Letting agent</option>
            <option value="property_manager">Property manager</option>
            <option value="maintenance_company">Maintenance company</option>
            <option value="housing_association">Housing association</option>
            <option value="facilities_management">Facilities management</option>
            <option value="council">Council</option>
            <option value="holiday_lets">Holiday lets</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>
      {showMessage ? (
        <label className="mt-4 block text-sm">
          <span className="font-medium text-ink">Message (optional)</span>
          <textarea
            name="message"
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
      ) : null}
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error ? (
        <p id={errorId} className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : submitLabel}
      </button>
      <p className="mt-3 text-xs text-muted">
        Pre-launch capture only. Production success includes a confirmation email accepted by the mail provider.
        Legal pages are drafts pending review.
      </p>
    </form>
  );
}
