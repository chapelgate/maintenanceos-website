/**
 * The Railway control plane that used to receive leads and events now
 * returns HTTP 404 "Application not found" for every path. Do not post to it.
 */
export const RETIRED_LEAD_HOST = "rsfm-control-plane-production.up.railway.app";

/**
 * Primary business mailbox already named as the website lead notification
 * destination in docs/WEBSITE_INTEGRATION_PROBLEM_LOG_2026-09-28.md.
 * Not invented for this fallback.
 */
export const PUBLIC_ENQUIRY_EMAIL = "andy@chapelgatehome.uk";

export const ENQUIRY_UNAVAILABLE_MESSAGE =
  "Online enquiries are temporarily unavailable. Please email andy@chapelgatehome.uk.";

export function usableHttpEndpoint(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (url.hostname === RETIRED_LEAD_HOST) return "";
    return url.toString();
  } catch {
    return "";
  }
}
