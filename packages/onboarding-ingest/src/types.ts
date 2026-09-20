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
