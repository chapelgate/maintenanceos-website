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

const DRAFT_KEYS = [
  "businessName",
  "greeting",
  "hours",
  "services",
  "faqs",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DRAFT_FIELD = 4000;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function normalisePublicUrl(raw: string): string | null {
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
  return parts.join("\n");
}
