export {
  CREATE_JOURNEY_STEPS,
  EMPTY_RECEPTIONIST_DRAFT,
  createJourneyNextAction,
  createJourneyStepAnnouncement,
  createJourneyStepStatus,
  createJourneyStepStatusLabel,
  isCreateScanReady,
  isValidEmail,
  normalisePublicUrl,
  type CreateJourneyStep,
  type CreateJourneyStepStatus,
  type CreateScanProgress,
  type ReceptionistDraft,
} from "./onboarding-create-core.ts";

import type {
  CreateScanProgress,
  ReceptionistDraft,
} from "./onboarding-create-core.ts";

const DRAFT_KEYS = [
  "businessName",
  "greeting",
  "hours",
  "services",
  "faqs",
] as const;

const MAX_DRAFT_FIELD = 4000;

export function createScanProgressTitle(progress: CreateScanProgress): string {
  switch (progress) {
    case "scanning":
      return "Asking the scan service…";
    case "queued":
      return "Crawl queued — next: review a blank draft";
    case "scanned":
      return "Scan ready — next: review extracted fields";
    case "scanned_empty":
      return "Scan returned nothing — next: complete the draft";
    case "scan_failed":
      return "Scan failed — next: complete the draft";
    case "checking":
    default:
      return "Checking URL…";
  }
}

/**
 * Visible empty-state for hours/services. Never a sample timetable or service list.
 */
export function emptyHoursOrServicesNote(
  field: "hours" | "services",
  value: string | undefined,
): string | null {
  if (typeof value === "string" && value.trim()) return null;
  return field === "hours"
    ? "Empty — not on file. Opening hours were not invented."
    : "Empty — not on file. Services were not invented.";
}

/** Hostname-derived hint only — not crawl output. */
export function hostnameBusinessHint(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").replace(/\.$/, "");
    const first = host.split(".")[0] ?? "";
    return first.replace(/[-_]+/g, " ").trim();
  } catch {
    return "";
  }
}

function asDraftString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_DRAFT_FIELD);
}

function pickDraftSource(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;
  if (root.draft && typeof root.draft === "object" && !Array.isArray(root.draft)) {
    return root.draft as Record<string, unknown>;
  }
  return root;
}

/** Map only known string fields. Never invent values for missing keys. */
export function mapScanResponse(body: unknown): Partial<ReceptionistDraft> {
  const src = pickDraftSource(body);
  if (!src) return {};
  const out: Partial<ReceptionistDraft> = {};
  for (const key of DRAFT_KEYS) {
    const value = asDraftString(src[key]);
    if (value) out[key] = value;
  }
  return out;
}

const FIELD_META_SOURCES = new Set([
  "jsonld",
  "microdata",
  "meta",
  "title",
  "heading",
  "nav",
  "pattern",
  "contact_link",
  "details",
]);
const FIELD_META_CONFIDENCE = new Set(["high", "medium", "low"]);

export type DraftFieldMeta = {
  confidence: "high" | "medium" | "low";
  source: string;
};

export type ScanDraftFieldMeta = Partial<Record<keyof ReceptionistDraft, DraftFieldMeta>>;

/** Human labels for mapped `fieldMeta.source` values. Unknown sources stay unlabelled. */
export const FIELD_META_SOURCE_LABELS: Record<string, string> = {
  jsonld: "JSON-LD",
  microdata: "schema.org microdata",
  meta: "page metadata",
  title: "page title",
  heading: "labelled heading",
  nav: "navigation links",
  pattern: "visible text pattern",
  contact_link: "phone/email links",
  details: "FAQ accordion",
};

/**
 * Per-field review hint for `/create` draft step.
 * Returns null when provenance is missing or the field is empty — never invents a value.
 */
export function scanFieldReviewHint(
  meta: DraftFieldMeta | undefined,
  fieldValue: string | undefined,
): string | null {
  if (!meta) return null;
  if (typeof fieldValue !== "string" || !fieldValue.trim()) return null;
  const source = FIELD_META_SOURCE_LABELS[meta.source];
  if (!source) return null;
  const check = meta.confidence === "low" ? " — check this" : "";
  return `Scan copied this from ${source} (${meta.confidence} confidence${check}). Untrusted page text — not a live receptionist.`;
}

/** Optional provenance. Unknown keys/values are dropped — never inferred. */
export function mapScanFieldMeta(body: unknown): ScanDraftFieldMeta {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const raw = (body as { fieldMeta?: unknown }).fieldMeta;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const src = raw as Record<string, unknown>;
  const out: ScanDraftFieldMeta = {};
  for (const key of DRAFT_KEYS) {
    const item = src[key];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const rec = item as Record<string, unknown>;
    const confidence =
      typeof rec.confidence === "string" && FIELD_META_CONFIDENCE.has(rec.confidence)
        ? (rec.confidence as DraftFieldMeta["confidence"])
        : undefined;
    const source =
      typeof rec.source === "string" && FIELD_META_SOURCES.has(rec.source)
        ? rec.source
        : undefined;
    if (confidence && source) out[key] = { confidence, source };
  }
  return out;
}

export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type ScanOutcome =
  | { status: "disabled" }
  | { status: "ok"; draft: Partial<ReceptionistDraft>; fieldMeta: ScanDraftFieldMeta }
  | { status: "error"; message: string };

const SCAN_TIMEOUT_MS = 15_000;

export async function requestOnboardingScan(
  endpoint: string,
  url: string,
): Promise<ScanOutcome> {
  const trimmed = endpoint.trim();
  if (!trimmed) return { status: "disabled" };
  if (!isAbsoluteHttpUrl(trimmed)) {
    return {
      status: "error",
      message:
        "Scan endpoint is not a valid http(s) URL. Static export cannot use relative API routes. No crawl results were invented.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);
  try {
    const res = await fetch(trimmed, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    if (!res.ok) {
      return {
        status: "error",
        message:
          "The scan service could not process this URL. No crawl results were invented.",
      };
    }
    return {
      status: "ok",
      draft: mapScanResponse(parsed),
      fieldMeta: mapScanFieldMeta(parsed),
    };
  } catch {
    return {
      status: "error",
      message:
        "The scan service is unavailable just now. No crawl results were invented.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function buildCreateLeadMessage(input: {
  businessUrl: string;
  draft: ReceptionistDraft;
  scanNote: string;
  fieldMeta?: ScanDraftFieldMeta;
  receptionist?: {
    knowledgePack: unknown;
    systemPrompt: string;
    limitations: string[];
  } | null;
}): string {
  const parts = [
    "Website-to-receptionist early access request.",
    `Business URL: ${input.businessUrl}`,
    `Scan: ${input.scanNote}`,
    "Draft JSON:",
    JSON.stringify(input.draft, null, 2),
  ];
  if (input.fieldMeta && Object.keys(input.fieldMeta).length) {
    parts.push("Field meta JSON:", JSON.stringify(input.fieldMeta, null, 2));
  }
  if (input.receptionist) {
    parts.push(
      "Receptionist knowledge pack JSON:",
      JSON.stringify(input.receptionist.knowledgePack, null, 2),
      "System prompt draft:",
      input.receptionist.systemPrompt,
      "Limitations:",
      JSON.stringify(input.receptionist.limitations, null, 2),
    );
  }
  return parts.join("\n");
}
