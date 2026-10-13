/**
 * The Railway control plane that used to receive leads and events now
 * returns HTTP 404 "Application not found" for every path. Do not post to it.
 */
export const RETIRED_LEAD_HOST = "rsfm-control-plane-production.up.railway.app";

/** Public contact address for human enquiries and early access. */
export const PUBLIC_ENQUIRY_EMAIL = "info@chapelgatetechnologies.com";

export const ENQUIRY_UNAVAILABLE_MESSAGE =
  "Online enquiries are temporarily unavailable. Please email info@chapelgatetechnologies.com.";

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
