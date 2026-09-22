/**
 * Phone AI marketing cards for `/features`.
 * Source: docs/competitive/PHONE_AI_FEATURE_INVENTORY.md (short card set).
 * Do not invent rows. Marketing cards are VERIFIED or UNDER_TEST only.
 */

export const FEATURE_STATUSES = [
  "VERIFIED",
  "UNDER_TEST",
  "NOT_ON_SITE",
] as const;

export type FeatureStatus = (typeof FEATURE_STATUSES)[number];

/** Legacy HAVE / COMING labels from the pre-inventory features page. */
export const legacyStatusMap = {
  VERIFIED: "HAVE",
  UNDER_TEST: "UNDER TEST",
  NOT_ON_SITE: "COMING",
} as const satisfies Record<FeatureStatus, string>;

export const FEATURE_GROUPS = [
  "onboarding",
  "knowledge",
  "telephony",
  "calendar_actions",
  "post_call",
  "uk_vertical",
] as const;

export type FeatureGroupId = (typeof FEATURE_GROUPS)[number];

export const featureGroupCopy = {
  onboarding: {
    heading: "Onboarding",
    lede: "Website → Check → Review → Pack. Early access — not a live receptionist.",
  },
  knowledge: {
    heading: "Knowledge",
    lede: "Draft fields from a public site, then a claims-safe pack. Empty stays empty.",
  },
  telephony: {
    heading: "Telephony",
    lede: "UK intake and transfer exist in source. Live always-on phone is not on this site.",
  },
  calendar_actions: {
    heading: "Calendar and actions",
    lede: "Calendars stay under test. Rules — not the model — own safety and money.",
  },
  post_call: {
    heading: "Post-call",
    lede: "Evidence in source; SAMPLE dashboard only. Not live analytics.",
  },
  uk_vertical: {
    heading: "UK maintenance vertical",
    lede: "999 versus jobs, no client-money, *OS naming. Trades packs remain under test.",
  },
} as const satisfies Record<
  FeatureGroupId,
  { heading: string; lede: string }
>;

export type PhoneAiFeatureCard = {
  id: string;
  title: string;
  status: FeatureStatus;
  group: FeatureGroupId;
  /** One UK-ops line from the inventory. */
  ukOpsLine: string;
  bullets?: readonly string[];
  sources: readonly string[];
};

export const marketingFeatureStatusLabel = {
  VERIFIED: "VERIFIED",
  UNDER_TEST: "UNDER TEST",
} as const;

/**
 * Short marketing card set — VERIFIED and carefully UNDER_TEST only.
 * IDs match docs/competitive/PHONE_AI_FEATURE_INVENTORY.md.
 */
export const phoneAiMarketingCards: readonly PhoneAiFeatureCard[] = [
  {
    id: "M-ONB-01",
    title: "Website → receptionist funnel",
    status: "UNDER_TEST",
    group: "onboarding",
    ukOpsLine:
      "Start from a public UK maintenance website, review the draft, then a knowledge pack — early access only.",
    bullets: [
      "Public /create path: Website → Check → Review → Pack, then an early-access lead. Exists today. Not a live receptionist or a 30-second phone number.",
    ],
    sources: ["F-01"],
  },
  {
    id: "M-KNO-01",
    title: "Website knowledge extract",
    status: "UNDER_TEST",
    group: "knowledge",
    ukOpsLine:
      "When a scan endpoint is configured, draft hours and services can be copied from a public site — empty fields stay empty.",
    bullets: [
      "SSRF-safe website scan companion. Otherwise the crawl is queued. Not a live Fonio-parity knowledge crawl.",
    ],
    sources: ["F-02"],
  },
  {
    id: "M-KNO-02",
    title: "Knowledge pack from reviewed draft",
    status: "UNDER_TEST",
    group: "knowledge",
    ukOpsLine:
      "Reviewed name, hours, services, and FAQs become a claims-safe pack — missing keys stay missing.",
    bullets: [
      "Knowledge pack + system prompt from the reviewed /create draft. Not a live tenant or trained knowledge base.",
    ],
    sources: ["F-03"],
  },
  {
    id: "M-TEL-01",
    title: "UK caller intake",
    status: "VERIFIED",
    group: "telephony",
    ukOpsLine:
      "Designed to collect caller details in UK maintenance language, with 999 guidance (never 911) and no invented bookings.",
    bullets: [
      "UK terminology and 999 emergency guidance in product source and regressions.",
      "Receptionist designed to collect caller details.",
      "Must not invent bookings, dispatches, refunds, compensation, account information, or safety assurances.",
    ],
    sources: ["V-02", "V-03", "V-05"],
  },
  {
    id: "M-TEL-02",
    title: "Human transfer on request",
    status: "VERIFIED",
    group: "telephony",
    ukOpsLine:
      "Callers can ask for a person; transfer is explicit-request-only in product source.",
    bullets: [
      "Shared policy across voice providers.",
      "Transfer quality on carrier remains under retest — not marketed as proven live.",
    ],
    sources: ["V-04"],
  },
  {
    id: "M-TEL-03",
    title: "AI voice receptionist",
    status: "UNDER_TEST",
    group: "telephony",
    ukOpsLine:
      "Voice intake exists in product source and is under testing — not a public always-on maintenance line.",
    bullets: [
      "Gemini Live primary in product configuration. Not a live commercial always-on service.",
    ],
    sources: ["V-01"],
  },
  {
    id: "M-TEL-04",
    title: "Scripted sandbox and benchmark",
    status: "UNDER_TEST",
    group: "telephony",
    ukOpsLine:
      "A flagged, pack-aware scripted demo can answer from stored hours and services — never from invented live-call success.",
    bullets: [
      "Pack-aware scripted sandbox test call — flagged, off by default. Frozen telephony unused.",
      "Scripted conversation benchmark exists for fixture scoring. Passing the runner is not voice-quality parity. Not a live customer phone.",
    ],
    sources: ["F-04", "F-05"],
  },
  {
    id: "M-CAL-01",
    title: "Calendar connect",
    status: "UNDER_TEST",
    group: "calendar_actions",
    ukOpsLine:
      "Flagged adapters (mock plus Google / Microsoft 365 OAuth scaffolds) — this site never invents a booked slot.",
    bullets: [
      "/create says coming / under testing unless a local flag is on. Not customer-GA; not live on staging. No voice booking confirmation.",
    ],
    sources: ["matrix calendar PARTIAL"],
  },
  {
    id: "M-CAL-02",
    title: "Rules own safety and money",
    status: "VERIFIED",
    group: "calendar_actions",
    ukOpsLine:
      "Deterministic server rules own lifecycle, approvals, and money boundaries — the model cannot execute client-money or invent a van.",
    bullets: [
      "AI does not override safety, lifecycle, or approvals.",
      "Critical-safety latch requires authorised human clearance.",
      "Escalation / human-review queues for RED cases.",
      "No payment, refund, compensation, fee-waiver, or client-money execution.",
    ],
    sources: ["O-03", "O-04", "O-05", "O-06"],
  },
  {
    id: "M-POST-01",
    title: "Action evidence",
    status: "VERIFIED",
    group: "post_call",
    ukOpsLine:
      "Affirmative operational claims are designed to need verified success evidence — not a live analytics dashboard.",
    bullets: [
      "Audit events and action-evidence patterns in product source.",
      "Tenant-scoped call-session records exist as part of the operating trail.",
    ],
    sources: ["S-03", "O-02"],
  },
  {
    id: "M-POST-02",
    title: "Call history foundation",
    status: "UNDER_TEST",
    group: "post_call",
    ukOpsLine:
      "Flagged dashboard for SAMPLE transcripts and a bookings stub — off by default, never presented as live telephony history.",
    bullets: [
      "When the flag is off the page says coming / under testing.",
      "SAMPLE / DEMO rows are labelled examples; an empty store does not invent customers.",
    ],
    sources: ["matrix dashboard PARTIAL"],
  },
  {
    id: "M-UK-01",
    title: "Emergency triage vs jobs",
    status: "VERIFIED",
    group: "uk_vertical",
    ukOpsLine:
      "999 is emergency services; a leaky tap stays a structured job. Critical safety is designed to latch for a person.",
    bullets: [
      "UK/999 guidance locked in product source (never 911).",
      "Danger latches for a person; routine fabric stays structured intake.",
    ],
    sources: ["V-02", "O-04", "O-05"],
  },
  {
    id: "M-UK-02",
    title: "No client-money authority",
    status: "VERIFIED",
    group: "uk_vertical",
    ukOpsLine:
      "Quote and invoice checks may exist; payment, refund, compensation, fee-waiver, and client-money execution do not.",
    bullets: [
      "No client-money execution authority for the model or automated money movement.",
    ],
    sources: ["O-06"],
  },
  {
    id: "M-UK-03",
    title: "Industry *OS naming",
    status: "VERIFIED",
    group: "uk_vertical",
    ukOpsLine:
      "LandlordOS through HolidayLetOS name UK maintenance roles on this site — positioning, not a live phone per vertical.",
    bullets: ["Industry *OS portfolio naming exists on /industries/*."],
    sources: ["matrix UK HAVE"],
  },
  {
    id: "M-UK-04",
    title: "Maintenance trades language",
    status: "UNDER_TEST",
    group: "uk_vertical",
    ukOpsLine:
      "Industry pages contrast contractor-dispatch language and out-of-hours honesty with a generic receptionist. Product trades packs remain under test.",
    bullets: [
      "Out-of-hours capture is designed behaviour — not a public always-on phone.",
      "Do not claim product superiority beyond positioning.",
    ],
    sources: ["matrix UK PARTIAL"],
  },
] as const;

export type NotClaimedItem = {
  id: string;
  label: string;
  status: "NOT_ON_SITE";
};

/** NOT_ON_SITE / COMING — forbid list only, never present-capability cards. */
export const phoneAiNotClaimed: readonly NotClaimedItem[] = [
  {
    id: "N-01",
    label: "Live always-on customer phone / public receptionist number",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-02",
    label: "Commercially live / generally available product",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-03",
    label: "Concurrent multi-line capacity numbers",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-04",
    label: "Beats Fonio / Fonio voice-quality parity",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-05",
    label: "Public customer portal, account login, or billing GA",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-06",
    label: "ISO / SOC 2 / bank-grade / other unearned certifications",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-07",
    label: "Fake uptime, logos, awards, or reviews",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-08",
    label: "Payment, refund, or client-money execution",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-09",
    label: "Customer-facing live calendar book / reschedule",
    status: "NOT_ON_SITE",
  },
  {
    id: "N-10",
    label: "Instant live number / 30-second live phone",
    status: "NOT_ON_SITE",
  },
] as const;

export const MARKETING_CARD_STATUSES = ["VERIFIED", "UNDER_TEST"] as const;

export type MarketingCardStatus = (typeof MARKETING_CARD_STATUSES)[number];

export function isMarketingCardStatus(
  status: FeatureStatus,
): status is MarketingCardStatus {
  return status === "VERIFIED" || status === "UNDER_TEST";
}

export function marketingCardsByGroup(group: FeatureGroupId) {
  return phoneAiMarketingCards.filter((card) => card.group === group);
}

export const PHONE_AI_INVENTORY_DOC =
  "docs/competitive/PHONE_AI_FEATURE_INVENTORY.md";
