"use client";

import { FormEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import type { LeadType } from "@/config/site";
import { siteConfig } from "@/config/site";
import { submitLead, type LeadSuccessMode } from "@/lib/lead-adapter";
import { isValidEmail } from "@/lib/onboarding-create-core";
import { trackWebsiteEvent } from "@/lib/measurement";
import {
  buildEnquiryMailto,
  PUBLIC_ENQUIRY_EMAIL,
  isValidEnquiryPhone,
  type EnquiryMailtoDraft,
} from "@/lib/public-enquiry";

const subscribeHydration = () => () => {};
const clientHydratedSnapshot = () => true;
const serverHydratedSnapshot = () => false;

export type LeadCaptureFormProps = {
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
  showMessage = true,
  showOrganisation = true,
  id,
}: LeadCaptureFormProps) {
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

function readDraftFromForm(
  form: HTMLFormElement,
  leadType: LeadType,
): EnquiryMailtoDraft {
  const fd = new FormData(form);
  return buildEnquiryMailto({
    leadType,
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    organisation: String(fd.get("organisation") ?? ""),
    businessType: String(fd.get("role") ?? ""),
    role: String(fd.get("role") ?? ""),
    message: String(fd.get("message") ?? ""),
  });
}

function LeadCaptureFormFields({
  leadType,
  title,
  helper,
  submitLabel = "Submit",
  showMessage = true,
  showOrganisation = true,
  id,
}: LeadCaptureFormProps) {
  const addressReady = useSyncExternalStore(
    subscribeHydration,
    clientHydratedSnapshot,
    serverHydratedSnapshot,
  );
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "mailto_ready" | "error"
  >("idle");
  const [successMode, setSuccessMode] =
    useState<LeadSuccessMode>("local_stub");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [receiptReference, setReceiptReference] = useState<string | null>(null);
  const [mailtoDraft, setMailtoDraft] = useState<EnquiryMailtoDraft | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const mailtoStatusRef = useRef<HTMLDivElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const emailErrorId = useId();
  const phoneErrorId = useId();
  const errorSummaryId = useId();
  const errorSummaryHeadingId = useId();
  const emailFieldId = useId();
  const phoneFieldId = useId();

  async function onCopyDetails() {
    const draft =
      mailtoDraft ??
      (formRef.current ? readDraftFromForm(formRef.current, leadType) : null);
    if (!draft) return;
    setMailtoDraft(draft);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft.copyText);
        setCopyFeedback("Details copied. Paste them into an email to complete your enquiry.");
        return;
      }
    } catch {
      setCopyFeedback(null);
    }
    setCopyFeedback("Copy details from the summary below and email us directly.");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPhoneError(null);
    setFieldErrors({});
    setCopyFeedback(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const website = String(fd.get("website") ?? "");
    if (website.trim()) {
      setReceiptReference(null);
      setSuccessMode("accepted");
      setStatus("success");
      return;
    }
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const emailInvalid = !email || !isValidEmail(email);
    const phoneInvalid = Boolean(phone) && !isValidEnquiryPhone(phone);
    const errors: Record<string, string> = {};
    if (emailInvalid) {
      const msg = email ? "Enter a valid email address." : "Enter an email address.";
      setEmailError(msg);
      errors.email = msg;
    }
    if (phoneInvalid) {
      const msg = "Enter a valid phone number.";
      setPhoneError(msg);
      errors.phone = msg;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("error");
      requestAnimationFrame(() => {
        if (Object.keys(errors).length > 1) {
          errorSummaryRef.current?.focus();
          return;
        }
        if (errors.email) {
          emailRef.current?.focus();
          return;
        }
        if (errors.phone) {
          phoneRef.current?.focus();
        }
      });
      return;
    }

    if (!siteConfig.formEndpoint.trim()) {
      const draft = buildEnquiryMailto({
        leadType,
        name: String(fd.get("name") ?? ""),
        email,
        phone,
        organisation: String(fd.get("organisation") ?? ""),
        businessType: String(fd.get("role") ?? ""),
        role: String(fd.get("role") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      setMailtoDraft(draft);
      setStatus("mailto_ready");
      if (typeof window !== "undefined") {
        window.location.href = draft.mailtoHref;
      }
      requestAnimationFrame(() => mailtoStatusRef.current?.focus());
      return;
    }

    setStatus("submitting");
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

  return (
    <form
      ref={formRef}
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
      <p className="mt-2 text-xs text-muted">
        Only email is required. Everything else is optional. When no form endpoint is configured, submitting opens your email app with a prefilled WorkSmartOS draft — nothing is sent until you press send.
      </p>
      {Object.keys(fieldErrors).length > 0 ? (
        <div
          ref={errorSummaryRef}
          id={errorSummaryId}
          tabIndex={-1}
          data-lead-error-summary="true"
          className="mt-4 rounded-md border border-red-700 bg-red-50 p-4"
          role="alert"
          aria-live="assertive"
          aria-labelledby={errorSummaryHeadingId}
        >
          <h3
            id={errorSummaryHeadingId}
            className="font-semibold text-red-700"
          >
            Please fix the following:
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-red-700" role="list">
            {fieldErrors.email ? (
              <li>
                <a
                  href={`#${emailFieldId}`}
                  className="underline hover:no-underline"
                >
                  Email: {fieldErrors.email}
                </a>
              </li>
            ) : null}
            {fieldErrors.phone ? (
              <li>
                <a
                  href={`#${phoneFieldId}`}
                  className="underline hover:no-underline"
                >
                  Phone: {fieldErrors.phone}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
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
            ref={emailRef}
            id={emailFieldId}
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={
              [
                emailError ? emailErrorId : undefined,
                fieldErrors.email ? errorSummaryId : undefined,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
          {emailError ? (
            <span
              id={emailErrorId}
              className="mt-1 block text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              {emailError}
            </span>
          ) : null}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Phone (optional)</span>
          <input
            ref={phoneRef}
            id={phoneFieldId}
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={
              [
                phoneError ? phoneErrorId : undefined,
                fieldErrors.phone ? errorSummaryId : undefined,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
          {phoneError ? (
            <span
              id={phoneErrorId}
              className="mt-1 block text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              {phoneError}
            </span>
          ) : null}
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
          <span className="font-medium text-ink">Business type / Role (optional)</span>
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
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error ? (
        <p
          id={errorId}
          className="mt-3 text-sm text-red-700"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCopyDetails}
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-md border border-border bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent"
        >
          Copy details
        </button>
      </div>
      {copyFeedback ? (
        <p className="mt-3 text-xs text-ink" role="status" aria-live="polite">
          {copyFeedback}
        </p>
      ) : null}
      {status === "mailto_ready" && mailtoDraft ? (
        <div
          ref={mailtoStatusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          data-enquiry-mailto-ready=""
          className="mt-4 rounded-md border border-border bg-paper p-4 text-xs text-ink"
        >
          <p className="font-semibold text-ink">
            Your email app was opened with your WorkSmartOS enquiry draft. Nothing is sent until you press send in your email app.
          </p>
          <p className="mt-2 text-muted">
            If your mail client did not open, use{" "}
            <a
              href={mailtoDraft.mailtoHref}
              className="font-semibold text-accent underline"
            >
              this prefilled email link
            </a>{" "}
            or copy the details above and email{" "}
            <span className="font-mono text-ink">{PUBLIC_ENQUIRY_EMAIL}</span>.
          </p>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Submitting opens your email app and nothing is sent until you press send. If your email app does not open, use Copy details or email{" "}
        {addressReady ? (
          <a
            href={`mailto:${PUBLIC_ENQUIRY_EMAIL}`}
            className="font-medium text-accent underline"
          >
            {PUBLIC_ENQUIRY_EMAIL}
          </a>
        ) : (
          <span className="font-medium text-accent">our direct email</span>
        )}
        . Pre-launch capture only. Legal pages are drafts pending review.
      </p>
    </form>
  );
}

