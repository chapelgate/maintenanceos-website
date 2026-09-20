"use client";

import { FormEvent, useId, useState } from "react";
import { submitLead } from "@/lib/lead-adapter";

type Status = "idle" | "submitting" | "success" | "error";

function normalisePublicUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Claims-safe early-access capture for website→receptionist.
 * Business URL goes in `message` because `website` is the honeypot on submitLead.
 */
export function CreateReceptionistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    if (String(fd.get("website") ?? "").trim()) {
      setStatus("success");
      return;
    }

    const businessUrl = normalisePublicUrl(String(fd.get("businessUrl") ?? ""));
    if (!businessUrl) {
      setError(
        "Enter a valid public website URL (for example https://example.com).",
      );
      setStatus("error");
      return;
    }

    setStatus("submitting");
    const result = await submitLead({
      leadType: "create_receptionist",
      email: String(fd.get("email") ?? ""),
      name: String(fd.get("name") ?? ""),
      organisation: String(fd.get("organisation") ?? ""),
      message: `Website-to-receptionist early access. Business URL: ${businessUrl}`,
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
    e.currentTarget.reset();
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
          request. No live phone number was provisioned and no confirmation
          email was sent from this form.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-md border border-border bg-surface p-6 shadow-sm"
      noValidate
      data-lead-type="create_receptionist"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-ink">Business website URL</span>
          <input
            name="businessUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            required
            placeholder="https://your-business.co.uk"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
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
          <span className="font-medium text-ink">Email (required)</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={status === "error" || undefined}
            aria-describedby={status === "error" && error ? errorId : undefined}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-ink">Organisation</span>
          <input
            name="organisation"
            type="text"
            autoComplete="organization"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
      </div>
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
        {status === "submitting" ? "Submitting…" : "Join early access"}
      </button>
      <p className="mt-3 text-xs text-muted">
        Pre-launch capture only. Submitting does not send you email and does not
        create a live receptionist.
      </p>
    </form>
  );
}
