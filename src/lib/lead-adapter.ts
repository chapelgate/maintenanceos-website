import type { LeadType } from "../config/site.ts";
import { siteConfig } from "../config/site.ts";
import { ENQUIRY_UNAVAILABLE_MESSAGE } from "./public-enquiry.ts";

export type LeadPayload = {
  leadType: LeadType;
  email: string;
  name?: string;
  organisation?: string;
  role?: string;
  message?: string;
  /** Honeypot — must stay empty */
  website?: string;
  submissionId?: string;
};

/**
 * `local_stub` — no endpoint configured (client-only).
 * `queued_stub` — endpoint stored the lead without delivery (local stub).
 * `accepted` — endpoint accepted the lead. Never means email was sent.
 */
export type LeadSuccessMode = "local_stub" | "queued_stub" | "accepted";

export type LeadResult =
  | {
      ok: true;
      mode: LeadSuccessMode;
      reference?: string;
      confirmationEmail?: "accepted" | "failed";
    }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseMode(body: unknown): LeadSuccessMode | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const mode = (body as { mode?: unknown }).mode;
  if (mode === "queued_stub" || mode === "local_stub") return "queued_stub";
  if (mode === "accepted" || mode === "submitted") return "accepted";
  return null;
}


function parseReference(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const reference = (body as { reference?: unknown }).reference;
  return typeof reference === "string" && reference.trim()
    ? reference.trim()
    : null;
}

function parseConfirmationEmail(body: unknown): "accepted" | "failed" | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const value = (body as { confirmation_email?: unknown }).confirmation_email;
  return value === "accepted" || value === "failed" ? value : null;
}

function parseError(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as { error?: unknown; detail?: unknown };
  const error =
    typeof record.error === "string"
      ? record.error
      : typeof record.detail === "string"
        ? record.detail
        : null;
  return error && error.trim() ? error.trim() : null;
}

function bodyOkFlag(body: unknown): boolean | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const ok = (body as { ok?: unknown }).ok;
  if (ok === true) return true;
  if (ok === false) return false;
  return null;
}

/**
 * Static-friendly lead adapter.
 * Posts to the configured production endpoint (NEXT_PUBLIC_FORM_ENDPOINT may override it).
 * Success never means a visitor confirmation email was sent.
 */
export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  if (payload.website) {
    // Honeypot tripped — pretend success without claiming email.
    return { ok: true, mode: "local_stub" };
  }

  const email = payload.email.trim();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const endpoint = siteConfig.formEndpoint.trim();
  if (!endpoint) {
    return { ok: false, error: ENQUIRY_UNAVAILABLE_MESSAGE };
  }

  if (!isAbsoluteHttpUrl(endpoint)) {
    return {
      ok: false,
      error:
        "Form endpoint is not a valid http(s) URL. Static export cannot use relative API routes.",
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        lead_type: payload.leadType,
        email,
        name: payload.name?.trim() || undefined,
        organisation: payload.organisation?.trim() || undefined,
        role: payload.role?.trim() || undefined,
        message: payload.message?.trim() || undefined,
        source_url:
          typeof window !== "undefined" ? window.location.href : undefined,
        submission_id: payload.submissionId?.trim() || undefined,
      }),
    });

    let parsed: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    if (bodyOkFlag(parsed) === false) {
      return {
        ok: false,
        error:
          parseError(parsed) ??
          "We could not submit just now. Please try again shortly.",
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        error:
          parseError(parsed) ??
          "We could not submit just now. Please try again shortly.",
      };
    }

    return {
      ok: true,
      mode: parseMode(parsed) ?? "accepted",
      reference: parseReference(parsed) ?? undefined,
      confirmationEmail: parseConfirmationEmail(parsed) ?? undefined,
    };
  } catch {
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
