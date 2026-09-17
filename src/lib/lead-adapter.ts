import type { LeadType } from "@/config/site";
import { siteConfig } from "@/config/site";

export type LeadPayload = {
  leadType: LeadType;
  email: string;
  name?: string;
  organisation?: string;
  role?: string;
  message?: string;
  /** Honeypot — must stay empty */
  website?: string;
};

export type LeadResult =
  | { ok: true; mode: "submitted" | "queued_stub" }
  | { ok: false; error: string };

/**
 * Static-friendly lead adapter.
 * Posts to NEXT_PUBLIC_FORM_ENDPOINT when set; otherwise returns a local
 * success stub without claiming email was sent.
 */
export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  if (payload.website) {
    // Honeypot tripped — pretend success.
    return { ok: true, mode: "queued_stub" };
  }

  const email = payload.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const endpoint = siteConfig.formEndpoint.trim();
  if (!endpoint) {
    return { ok: true, mode: "queued_stub" };
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
        source: "maintenanceos-website",
        public_launch: siteConfig.publicLaunch,
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        error: "We could not submit just now. Please try again shortly.",
      };
    }
    return { ok: true, mode: "submitted" };
  } catch {
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
