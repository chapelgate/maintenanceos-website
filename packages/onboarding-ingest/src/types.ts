/**
 * Shared types for the feature-flagged onboarding scan service.
 *
 * Crawl text is untrusted data — never a system prompt.
 * Field names match `src/lib/onboarding-create.ts` (`ReceptionistDraft`).
 */

export const DRAFT_KEYS = [
  "businessName",
  "greeting",
  "hours",
  "services",
  "faqs",
] as const;

export type DraftKey = (typeof DRAFT_KEYS)[number];

/** Only known string fields. Omit a key rather than invent a value. */
export type ReceptionistDraft = {
  businessName: string;
  greeting: string;
  hours: string;
  services: string;
  faqs: string;
};

export type PartialDraft = Partial<ReceptionistDraft>;

/** Structured facts for Agent Factory intake. Values remain untrusted until reviewed. */
export type BusinessFacts = {
  website: string;
  businessName?: string;
  locations?: string[];
  contact?: {
    phones?: string[];
    emails?: string[];
  };
  services?: string[];
  hours?: string;
  faqs?: Array<{ question: string; answer: string }>;
};

export type BusinessFactKey = keyof BusinessFacts;
export type BusinessFactMeta = Partial<
  Record<BusinessFactKey, FieldMeta | { confidence: FieldConfidence; source: "fetched_url" }>
>;

/** Where a draft string was copied from. Advisory only — never a system prompt. */
export const FIELD_SOURCES = [
  "jsonld",
  "microdata",
  "meta",
  "title",
  "heading",
  "nav",
  "pattern",
  "contact_link",
  "details",
] as const;

export type FieldSource = (typeof FIELD_SOURCES)[number];

export type FieldConfidence = "high" | "medium" | "low";

export type FieldMeta = {
  confidence: FieldConfidence;
  source: FieldSource;
};

export type DraftFieldMeta = Partial<Record<DraftKey, FieldMeta>>;

export type ScanWarning = string;

export type ScanPageSource = {
  url: string;
  status: number;
  bytes: number;
};

export type ScanSuccess = {
  ok: true;
  untrusted: true;
  draft: PartialDraft;
  warnings: ScanWarning[];
  sources: ScanPageSource[];
  /** Structured Agent Factory facts; additive and backward-compatible with `draft`. */
  facts?: BusinessFacts;
  /** Provenance for structured facts. */
  factMeta?: BusinessFactMeta;
  /** Optional provenance for filled draft keys. `/create` ignores unknown keys. */
  fieldMeta?: DraftFieldMeta;
};

export type ScanFailure = {
  ok: false;
  error: string;
  message: string;
  warnings: ScanWarning[];
};

export type ScanResult = ScanSuccess | ScanFailure;

export type SafeHttpResponse = {
  status: number;
  headers: Record<string, string>;
  body: string;
  url: URL;
};

export type LookupFn = (hostname: string) => Promise<string[]>;

export type HttpGetFn = (
  url: URL,
  ip: string,
  opts: { timeoutMs: number; maxBytes: number },
) => Promise<SafeHttpResponse>;

export type ScanDeps = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  now?: () => number;
};

export class ScanError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus = 400) {
    super(message);
    this.name = "ScanError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}
