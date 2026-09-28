import type { LeadType } from "../config/site.ts";
import { siteConfig } from "../config/site.ts";

export type LeadPayload = {
  leadType: LeadType;
  email: string;
  name?: string;
  organisation?: string;
  role?: string;
  message?: string;
  /** Honeypot — must stay empty */
  website?: string;
  /** Stable per-journey identifier used for durable idempotency. */
  submissionId?: string;
};

/**
 * `local_stub` — no endpoint configured (client-only).
 * `queued_stub` — endpoint stored the lead without delivery (local stub).
 * `accepted` — endpoint durably accepted the lead. Email status is separate.
 */
export type LeadSuccessMode = "local_stub" | "queued_stub" | "accepted";

export type LeadConfirmationEmailStatus = "accepted" | "failed" | "not_confirmed";

export type LeadAcceptedResult = {
  ok: true;
  mode: LeadSuccessMode;
  reference?: string;
  confirmationEmail: LeadConfirmationEmailStatus;
  warning?: string;
};

export type LeadResult = LeadAcceptedResult | { ok: false; error: string };

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

function parseTextField(body: unknown, key: string): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseError(body: unknown): string | null {
  return parseTextField(body, "error") ?? parseTextField(body, "detail");
}

function acceptedAfterDeliveryFailure(
  detail: string | null,
): LeadAcceptedResult | null {
  if (detail === "lead recorded; customer confirmation is temporarily unavailable") {
    return {
      ok: true,
      mode: "accepted",
      confirmationEmail: "failed",
      warning:
        "Your request was recorded, but the confirmation email could not be handed off. Do not submit it again.",
    };
  }
  if (detail === "lead recorded; operator notification is temporarily unavailable") {
    return {
      ok: true,
      mode: "accepted",
      confirmationEmail: "not_confirmed",
      warning:
        "Your request was recorded, but the internal notification workflow is temporarily unavailable. Do not submit it again.",
    };
  }
  return null;
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
 * Email success is claimed only when the receiver explicitly reports provider handoff.
 */
export function createLeadSubmissionId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUuid) return `create-${randomUuid()}`;
  return `create-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  if (payload.website) {
    // Honeypot tripped — pretend success without claiming email.
    return {
      ok: true,
      mode: "local_stub",
      confirmationEmail: "not_confirmed",
    };
  }

  const email = payload.email.trim();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const endpoint = siteConfig.formEndpoint.trim();
  if (!endpoint) {
    return {
      ok: true,
      mode: "local_stub",
      confirmationEmail: "not_confirmed",
    };
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

    const detail = parseTextField(parsed, "detail");
    if (!res.ok) {
      const acceptedFailure = acceptedAfterDeliveryFailure(detail);
      if (acceptedFailure) return acceptedFailure;
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

    const confirmation = parseTextField(parsed, "confirmation_email");
    return {
      ok: true,
      mode: parseMode(parsed) ?? "accepted",
      reference: parseTextField(parsed, "reference") ?? undefined,
      confirmationEmail:
        confirmation === "accepted" ? "accepted" : "not_confirmed",
    };
  } catch {
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
