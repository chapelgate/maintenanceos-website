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
  website?: string;
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

export type SafeBinaryHttpResponse = {
  status: number;
  headers: Record<string, string>;
  body: Uint8Array;
  url: URL;
};

export type LookupFn = (hostname: string) => Promise<string[]>;

export type BinaryHttpGetFn = (
  url: URL,
  ip: string,
  opts: {
    timeoutMs: number;
    maxBytes: number;
    headers?: Record<string, string>;
  },
) => Promise<SafeBinaryHttpResponse>;

export type HttpGetFn = (
  url: URL,
  ip: string,
  opts: {
    timeoutMs: number;
    maxBytes: number;
    headers?: Record<string, string>;
    /** Opt-in response gzip decoding. Default false preserves Scanner V1. */
    acceptCompressed?: boolean;
    /** Hard ceiling after decompression when acceptCompressed is true. */
    maxDecompressedBytes?: number;
  },
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

/**
 * Scanner V2 additive corpus/manifest types.
 *
 * These are deliberately not wired into runScan yet. Scanner V1 remains the
 * production compatibility path until V2 independently passes its acceptance
 * gate. Crawl content stays untrusted data.
 */
export type CrawlState =
  | "DISCOVERING"
  | "CRAWLING"
  | "INDEXING"
  | "COMPLETE"
  | "PARTIAL"
  | "FAILED";

export type CrawlUrlStatus =
  | "queued"
  | "fetched"
  | "duplicate"
  | "policy_skipped"
  | "robots_skipped"
  | "unresolved";

export type CrawlDiscoveryReason =
  | "submitted"
  | "robots_sitemap"
  | "sitemap"
  | "html_link"
  | "rendered_link"
  | "canonical"
  | "document"
  | "cms_public_data";

export type CrawlFetchMode =
  | "http"
  | "static_data"
  | "rendered"
  | "reader"
  | "document";

export type CrawlUrlDisposition = {
  url: string;
  canonicalUrl?: string;
  status: CrawlUrlStatus;
  discoveryReason: CrawlDiscoveryReason;
  discoveredFrom?: string;
  reason?: string;
  /** Optional sitemap lastmod hint; advisory until a representation is fetched. */
  sitemapLastModified?: string;
  contentHash?: string;
  fetchedAt?: string;
  /** Stage 9 resumable execution metadata. Additive; absent on legacy manifests. */
  retryCount?: number;
  lastAttemptAt?: string;
};

export type CrawlPage = {
  requestedUrl: string;
  canonicalUrl: string;
  title?: string;
  headings: string[];
  visibleText: string;
  structuredFacts: Record<string, unknown>;
  contentType: string;
  fetchMode: CrawlFetchMode;
  contentHash: string;
  discoveredFrom?: string;
  fetchedAt: string;
  etag?: string;
  lastModified?: string;
};

export type CorpusChunk = {
  id: string;
  canonicalUrl: string;
  title?: string;
  headingPath: string[];
  text: string;
  ordinal: number;
  contentHash: string;
};

export type CrawlManifest = {
  crawlId: string;
  origin: string;
  state: CrawlState;
  discovered: number;
  queued: number;
  fetched: number;
  duplicate: number;
  policySkipped: number;
  robotsSkipped: number;
  unresolved: number;
  urls: CrawlUrlDisposition[];
};

export type CrawlLease = {
  crawlId: string;
  leaseKey: string;
  owner: string;
  expiresAt: string;
};



export type CrawlJob = {
  crawlId: string;
  origin: string;
  state: CrawlState;
  releaseSha: string;
  createdAt: string;
  updatedAt: string;
  retryLimit: number;
};
