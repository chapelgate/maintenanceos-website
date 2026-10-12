import { siteConfig, type LeadType } from "@/config/site";
import { usableHttpEndpoint } from "@/lib/public-enquiry";

export type WebsiteEventType =
  | "page_view"
  | "cta_click"
  | "form_submit_start"
  | "form_submit_success"
  | "form_submit_error"
  | "client_error";

export type WebsiteEventInput = {
  event: WebsiteEventType;
  targetPath?: string;
  leadType?: LeadType;
};

const PATH_RE = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%/\-]*$/;

function cleanPath(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const path = value.trim().slice(0, 240);
  if (!PATH_RE.test(path) || path.includes("?") || path.includes("#")) {
    return undefined;
  }
  return path;
}

function validEndpoint(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function eventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return "evt-" + crypto.randomUUID();
  }
  return (
    "evt-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 12)
  );
}

export function buildWebsiteEvent(
  input: WebsiteEventInput,
  currentPath: string,
) {
  return {
    event: input.event,
    path: cleanPath(currentPath) ?? "/",
    target_path: cleanPath(input.targetPath),
    lead_type: input.leadType,
    event_id: eventId(),
  };
}

/**
 * Fire-and-forget first-party operational measurement.
 *
 * Stored event records deliberately exclude visitor identity and browser
 * telemetry. The browser sends only bounded event/path data plus an ephemeral
 * per-event id for retry idempotency.
 */
export function trackWebsiteEvent(input: WebsiteEventInput): void {
  if (typeof window === "undefined") return;

  const endpoint = usableHttpEndpoint(siteConfig.measurementEndpoint);
  if (!endpoint || !validEndpoint(endpoint)) return;

  const body = JSON.stringify(
    buildWebsiteEvent(input, window.location.pathname || "/"),
  );

  void fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    keepalive: true,
    credentials: "omit",
    referrerPolicy: "no-referrer",
    cache: "no-store",
  }).catch(() => {
    // Measurement must never interrupt the visitor journey.
  });
}
