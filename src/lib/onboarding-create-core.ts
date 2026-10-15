export type ReceptionistDraft = {
  businessName: string;
  greeting: string;
  hours: string;
  services: string;
  faqs: string;
};

export const EMPTY_RECEPTIONIST_DRAFT: ReceptionistDraft = {
  businessName: "",
  greeting: "",
  hours: "",
  services: "",
  faqs: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export type CreateJourneyStep = 1 | 2 | 3 | 4 | 5;

export type CreateScanProgress =
  | "checking"
  | "scanning"
  | "queued"
  | "scanned"
  | "scanned_empty"
  | "scan_blocked"
  | "scan_failed";

/** Five-step /create funnel labels. Configuration remains website-only until later commissioning. */
export const CREATE_JOURNEY_STEPS: {
  step: CreateJourneyStep;
  label: string;
  nextAction: string;
}[] = [
  { step: 1, label: "Website", nextAction: "Check this website" },
  { step: 2, label: "Check", nextAction: "Choose agent" },
  { step: 3, label: "Choose", nextAction: "Configure agent" },
  { step: 4, label: "Configure", nextAction: "Generate reviewed configuration" },
  { step: 5, label: "Review & Try", nextAction: "Try your receptionist" },
];

export function isCreateScanReady(progress: CreateScanProgress): boolean {
  return (
    progress === "queued" ||
    progress === "scanned" ||
    progress === "scanned_empty" ||
    progress === "scan_blocked" ||
    progress === "scan_failed"
  );
}

export function createJourneyNextAction(
  step: CreateJourneyStep,
  progress?: CreateScanProgress,
): string {
  if (step === 2 && progress && !isCreateScanReady(progress)) {
    return "Checking…";
  }
  return CREATE_JOURNEY_STEPS[step - 1]?.nextAction ?? "Continue";
}

export type CreateJourneyStepStatus = "current" | "completed" | "upcoming";

/** Colour is not enough — AT and the visible stepper share this status. */
export function createJourneyStepStatus(
  itemStep: CreateJourneyStep,
  current: CreateJourneyStep,
): CreateJourneyStepStatus {
  if (itemStep === current) return "current";
  if (itemStep < current) return "completed";
  return "upcoming";
}

export function createJourneyStepStatusLabel(
  status: CreateJourneyStepStatus,
): string {
  if (status === "current") return "Current step";
  if (status === "completed") return "Completed";
  return "Not started";
}

/** Focus target / live announcement after a step change — not a live-phone claim. */
export function createJourneyStepAnnouncement(step: CreateJourneyStep): string {
  const item = CREATE_JOURNEY_STEPS[step - 1];
  return `Step ${step} of ${CREATE_JOURNEY_STEPS.length}: ${item?.label ?? "Website"}`;
}

export const UNSAFE_WEBSITE_URL_MESSAGE =
  "Enter a public https:// website. http://, localhost, and private network addresses (10.*, 172.16–31.*, 192.168.*, and 127.*) are not accepted.";

function isPrivateOrLoopbackHost(hostname: string): boolean {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return false;
  const octets = match.slice(1).map((part) => Number(part));
  if (octets.some((part) => part > 255)) return false;
  const [first, second] = octets;
  if (first === 10 || first === 127) return true;
  if (first === 192 && second === 168) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  return false;
}

/** Specific refusal for http, localhost, and private IPv4. Other junk returns null. */
export function unsafePublicUrlMessage(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (url.protocol === "http:" || isPrivateOrLoopbackHost(url.hostname)) {
      return UNSAFE_WEBSITE_URL_MESSAGE;
    }
  } catch {
    return null;
  }
  return null;
}

export function normalisePublicUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || unsafePublicUrlMessage(trimmed)) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    if (isPrivateOrLoopbackHost(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}
