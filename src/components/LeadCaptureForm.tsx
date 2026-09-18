"use client";

import { FormEvent, useState } from "react";
import type { LeadType } from "@/config/site";
import { submitLead } from "@/lib/lead-adapter";

type LeadCaptureFormProps = {
  leadType: LeadType;
  title?: string;
  helper?: string;
  submitLabel?: string;
  showMessage?: boolean;
  showOrganisation?: boolean;
  id?: string;
};

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
    "idle" | "submitting" | "success_stub" | "success_sent" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

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
          "We couldn’t send that. Try again, or email us if it keeps failing.",
      );
      setStatus("error");
      return;
    }
    setStatus(result.mode === "submitted" ? "success_sent" : "success_stub");
    e.currentTarget.reset();
  }

  if (status === "success_sent" || status === "success_stub") {
    return (
      <div
        id={id}
        className="rounded-md border border-border bg-surface p-6"
        role="status"
      >
        <p className="font-semibold text-ink">Thank you</p>
        {status === "success_sent" ? (
          <p className="mt-2 text-sm text-muted">
            Thanks — you’re on the early access list. We’ll be in touch with a
            briefing slot. Public always-on phone access isn’t open yet; we’ll
            say so plainly when that gate clears.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Your details have been recorded for this session. A form endpoint is
            not configured yet, so no email was sent. We will connect a lead
            queue before launch.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className="relative rounded-md border border-border bg-surface p-6 shadow-sm"
      noValidate
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
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Email *</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        {showOrganisation ? (
          <label className="block text-sm">
            <span className="font-medium text-ink">Organisation</span>
            <input
              name="organisation"
              type="text"
              autoComplete="organization"
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="font-medium text-ink">Role</span>
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
          <span className="font-medium text-ink">Message</span>
          <textarea
            name="message"
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
      ) : null}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : submitLabel}
      </button>
      <p className="mt-3 text-xs text-muted">
        We’ll only use this to contact you about MaintenanceOS evaluation. Legal
        pages are drafts pending review.
      </p>
    </form>
  );
}
