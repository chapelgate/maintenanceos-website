"use client";

import { FormEvent, useId, useState } from "react";
import type { LeadType } from "@/config/site";
import { submitLead, type LeadSuccessMode } from "@/lib/lead-adapter";

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
  // All success paths must stay truthful: accepting a lead ≠ sending email.
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
    body: "Your request was accepted into the lead queue. We will be in touch. No confirmation email was sent.",
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
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [successMode, setSuccessMode] =
    useState<LeadSuccessMode>("local_stub");
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await submitLead({
      leadType,
      email: String(fd.get("email") ?? ""),
      name: String(fd.get("name") ?? ""),
      organisation: String(fd.get("organisation") ?? ""),
      role: String(fd.get("role") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    });
    if (!result.ok) {
      setError(
        result.error ||
          "We could not submit just now. Please try again shortly.",
      );
      setStatus("error");
      return;
    }
    setSuccessMode(result.mode);
    setStatus("success");
    e.currentTarget.reset();
  }

  if (status === "success") {
    const copy = successCopy(successMode);
    return (
      <div
        id={id}
        className="mos-glass p-6"
        role="status"
        data-lead-success={successMode}
      >
        <p className="font-semibold text-ink">{copy.title}</p>
        <p className="mt-2 text-sm text-muted">{copy.body}</p>
      </div>
    );
  }

  const emailInvalid = status === "error" && Boolean(error);

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className="mos-glass relative overflow-hidden p-6"
      noValidate
      data-lead-type={leadType}
    >
      {title ? (
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      ) : null}
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-xl border border-border bg-white/80 px-3 py-2"
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
            className="mt-1 w-full rounded-xl border border-border bg-white/80 px-3 py-2"
          />
        </label>
        {showOrganisation ? (
          <label className="block text-sm">
            <span className="font-medium text-ink">Organisation</span>
            <input
              name="organisation"
              type="text"
              autoComplete="organization"
              className="mt-1 w-full rounded-xl border border-border bg-white/80 px-3 py-2"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="font-medium text-ink">Role</span>
          <select
            name="role"
            className="mt-1 w-full rounded-xl border border-border bg-white/80 px-3 py-2"
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
          <span className="font-medium text-ink">Message</span>
          <textarea
            name="message"
            rows={4}
            className="mt-1 w-full rounded-xl border border-border bg-white/80 px-3 py-2"
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
        className="mt-5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : submitLabel}
      </button>
      <p className="mt-3 text-xs text-muted">
        Pre-launch capture only. Submitting this form does not send you email.
        Legal pages are drafts pending review.
      </p>
    </form>
  );
}
