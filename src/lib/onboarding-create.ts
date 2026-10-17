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
  unsafePublicUrlMessage,
  UNSAFE_WEBSITE_URL_MESSAGE,
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
      return "Checking website setup…";
    case "queued":
      return "Website check complete — next: review the draft";

    case "scanned":
      return "Draft ready — next: review supplied fields";
    case "scanned_empty":
      return "No draft fields supplied — next: complete the draft";
    case "scan_crawling":
      return "Page budget reached — the draft so far is usable";
    case "scan_blocked":
      return "This site blocks automated reading — next: add the details yourself";
    case "scan_failed":
      return "Website check unavailable — next: complete the draft";
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
  "footer",
  "nav",
  "pattern",
  "contact_link",
  "details",
]);
const FIELD_META_CONFIDENCE = new Set(["high", "medium", "low"]);

export type DraftFieldMeta = {
  confidence: "high" | "medium" | "low";
  source: string;
  sourceUrl?: string;
};

export type ScanDraftFieldMeta = Partial<Record<keyof ReceptionistDraft, DraftFieldMeta>>;

export type ScanBusinessFacts = {
  website?: string;
  businessName?: string;
  address?: string;
  locations?: string[];
  contact?: { phones?: string[]; emails?: string[] };
  services?: string[];
  hours?: string;
  pricing?: string[];
  branches?: Array<{ name?: string; phone?: string; address?: string; hours?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
};

export type ScanBusinessFactKey = keyof ScanBusinessFacts;
export type ScanBusinessFactMeta = Partial<
  Record<
    ScanBusinessFactKey,
    { confidence: "high" | "medium" | "low"; source: string; sourceUrl?: string }
  >
>;

export type ScanSiteKnowledgeItem = {
  url: string;
  title?: string;
  headingPath: string[];
  text: string;
  contentHash: string;
};

/** Human labels for mapped `fieldMeta.source` values. Unknown sources stay unlabelled. */
export const FIELD_META_SOURCE_LABELS: Record<string, string> = {
  jsonld: "JSON-LD",
  microdata: "schema.org microdata",
  meta: "page metadata",
  title: "page title",
  heading: "labelled heading",
  footer: "page footer",
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
    if (confidence && source) {
      const sourceUrl = scanFactHttpsUrl(rec.sourceUrl);
      out[key] = sourceUrl ? { confidence, source, sourceUrl } : { confidence, source };
    }
  }
  return out;
}


function scanFactString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function scanFactStringArray(value: unknown, maxItems: number, maxChars: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .map((item) => scanFactString(item, maxChars))
    .filter((item): item is string => Boolean(item));
  const unique = [...new Set(out)].slice(0, maxItems);
  return unique.length ? unique : undefined;
}

function scanFactPhones(value: unknown): string[] | undefined {
  const raw = scanFactStringArray(value, 16, 80);
  if (!raw) return undefined;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const phone of raw) {
    if (!/^\+?[\d\s().-]+$/.test(phone)) continue;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) continue;
    const key =
      digits.startsWith("0044") && digits.length >= 12
        ? "0" + digits.slice(4)
        : digits.startsWith("44") && digits.length >= 11
          ? "0" + digits.slice(2)
          : digits;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(phone);
    if (out.length >= 8) break;
  }
  return out.length ? out : undefined;
}

function scanFactHttpsUrl(value: unknown): string | undefined {
  const text = scanFactString(value, 2048);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    return url.protocol === "https:" && url.hostname ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Allow-list structured scanner facts. Never copy unknown keys or credential-like material. */
export function mapScanBusinessFacts(body: unknown): ScanBusinessFacts {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const raw = (body as { facts?: unknown }).facts;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const src = raw as Record<string, unknown>;
  const out: ScanBusinessFacts = {};

  const website = scanFactHttpsUrl(src.website);
  if (website) out.website = website;

  const businessName = scanFactString(src.businessName, 200);
  if (businessName) out.businessName = businessName;

  const address = scanFactString(src.address, 500);
  if (address) out.address = address;

  const locations = scanFactStringArray(src.locations, 16, 500);
  if (locations) out.locations = locations;

  const pricing = scanFactStringArray(src.pricing, 12, 80);
  if (pricing) out.pricing = pricing;

  if (Array.isArray(src.branches)) {
    const branches = src.branches
      .map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return undefined;
        const rec = item as Record<string, unknown>;
        const name = scanFactString(rec.name, 120);
        const phone = scanFactString(rec.phone, 20);
        const address = scanFactString(rec.address, 240);
        const hours = scanFactString(rec.hours, 200);
        if (!name && !phone && !address && !hours) return undefined;
        return {
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          ...(address ? { address } : {}),
          ...(hours ? { hours } : {}),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 12);
    if (branches.length) out.branches = branches;
  }

  const services = scanFactStringArray(src.services, 100, 300);
  if (services) out.services = services;

  const hours = scanFactString(src.hours, 2000);
  if (hours) out.hours = hours;

  if (src.contact && typeof src.contact === "object" && !Array.isArray(src.contact)) {
    const contact = src.contact as Record<string, unknown>;
    const phones = scanFactPhones(contact.phones);
    const emails = scanFactStringArray(contact.emails, 8, 120)?.filter(
      (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    );
    if (phones?.length || emails?.length) {
      out.contact = {
        ...(phones?.length ? { phones } : {}),
        ...(emails?.length ? { emails } : {}),
      };
    }
  }

  if (Array.isArray(src.faqs)) {
    const faqs = src.faqs
      .slice(0, 100)
      .map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return null;
        const rec = item as Record<string, unknown>;
        const question = scanFactString(rec.question, 500);
        const answer = scanFactString(rec.answer, 2000);
        return question && answer ? { question, answer } : null;
      })
      .filter((item): item is { question: string; answer: string } => Boolean(item));
    if (faqs.length) out.faqs = faqs;
  }

  return out;
}

export function mapScanSiteKnowledge(body: unknown): ScanSiteKnowledgeItem[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) return [];
  const raw = (body as { knowledge?: unknown }).knowledge;
  if (!Array.isArray(raw)) return [];
  const out: ScanSiteKnowledgeItem[] = [];
  const seen = new Set<string>();
  let totalChars = 0;

  for (const item of raw) {
    if (out.length >= 200 || totalChars >= 300_000) break;
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const rec = item as Record<string, unknown>;
    const url = scanFactHttpsUrl(rec.url);
    const text = scanFactString(rec.text, Math.min(1_800, 300_000 - totalChars));
    const contentHash = scanFactString(rec.contentHash, 128);
    if (!url || !text || !contentHash) continue;
    const key = url + "\u0000" + contentHash;
    if (seen.has(key)) continue;
    seen.add(key);

    const title = scanFactString(rec.title, 200);
    const headingPath = scanFactStringArray(rec.headingPath, 8, 200) ?? [];
    out.push({
      url,
      ...(title ? { title } : {}),
      headingPath,
      text,
      contentHash,
    });
    totalChars += text.length;
  }
  return out;
}

const FACT_META_SOURCES = new Set([...FIELD_META_SOURCES, "fetched_url"]);

/** Map only provenance attached to facts that survived structured-fact validation. */
export function mapScanBusinessFactMeta(
  body: unknown,
  facts: ScanBusinessFacts = mapScanBusinessFacts(body),
): ScanBusinessFactMeta {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const raw = (body as { factMeta?: unknown }).factMeta;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const src = raw as Record<string, unknown>;
  const out: ScanBusinessFactMeta = {};
  const keys: ScanBusinessFactKey[] = [
    "website", "businessName", "address", "locations", "contact", "services", "hours", "pricing", "branches", "faqs",
  ];
  for (const key of keys) {
    if (facts[key] === undefined) continue;
    const item = src[key];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const rec = item as Record<string, unknown>;
    const confidence =
      typeof rec.confidence === "string" && FIELD_META_CONFIDENCE.has(rec.confidence)
        ? (rec.confidence as "high" | "medium" | "low")
        : undefined;
    const source =
      typeof rec.source === "string" && FACT_META_SOURCES.has(rec.source)
        ? rec.source
        : undefined;
    if (confidence && source) {
      const sourceUrl = scanFactHttpsUrl(rec.sourceUrl);
      out[key] = sourceUrl ? { confidence, source, sourceUrl } : { confidence, source };
    }
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

export type ScanRunSummary = {
  state: string;
  discovered: number;
  fetched: number;
  unresolved: number;
  warnings: string[];
  crawlId?: string;
};

export type ScanCoverage = {
  found: string[];
  missing: string[];
  detail: string;
};

const COVERAGE_LABELS: Record<(typeof DRAFT_KEYS)[number], string> = {
  businessName: "business name",
  greeting: "greeting",
  hours: "opening hours",
  services: "services",
  faqs: "questions and answers",
};

/**
 * PARTIAL with at least one fetched page: say what was copied and what is
 * still blank. Zero-fetch stays on ZERO_FETCH_PARTIAL_MESSAGE instead.
 */
export function describeScanCoverage(input: {
  summary: ScanRunSummary | null;
  draft: Partial<ReceptionistDraft>;
}): ScanCoverage | null {
  const summary = input.summary;
  if (!summary || summary.state !== "PARTIAL" || summary.fetched <= 0) return null;
  const found: string[] = [];
  const missing: string[] = [];
  for (const key of DRAFT_KEYS) {
    const value = input.draft[key];
    const label = COVERAGE_LABELS[key];
    if (typeof value === "string" && value.trim()) found.push(label);
    else missing.push(label);
  }
  const pages =
    summary.discovered === 1
      ? "Read 1 discovered public page."
      : `Read ${summary.fetched} of ${summary.discovered} discovered public pages.`;
  const unresolved =
    summary.unresolved > 0
      ? ` ${summary.unresolved} stayed unresolved.`
      : "";
  const refused = (summary.warnings ?? []).some((warning) => warning === "http_401" || warning === "http_403")
    ? " Some pages were refused and were not read."
    : "";
  const detail = `${pages}${unresolved}${refused} Continue and fill the gaps yourself. Nothing was invented.`;
  return { found, missing, detail };
}

const SKIPPED_PAGE_WARNINGS = new Set(["http_404", "content_type_not_supported"]);

/**
 * A finished or in-progress crawl can list pages that were not HTML.
 * That is a skip, not a failed scan.
 */
export function describeSkippedPages(summary: ScanRunSummary | null): string | null {
  if (!summary || summary.fetched <= 0) return null;
  const skipped = summary.warnings.some((warning) => SKIPPED_PAGE_WARNINGS.has(warning));
  return skipped ? "Some pages were skipped." : null;
}

/** CRAWLING with evidence stays usable. The visitor can continue the same crawl. */
export function scanProgressAfterResult(
  summary: ScanRunSummary | null,
  filled: boolean,
): "scanned" | "scanned_empty" | "scan_crawling" {
  if (summary?.state === "CRAWLING" && summary.fetched > 0) return "scan_crawling";
  return filled ? "scanned" : "scanned_empty";
}

export type ScanOutcome =
  | { status: "disabled" }
  | { status: "aborted" }
  | {
      status: "ok";
      draft: Partial<ReceptionistDraft>;
      fieldMeta: ScanDraftFieldMeta;
      facts: ScanBusinessFacts;
      factMeta: ScanBusinessFactMeta;
      siteKnowledge: ScanSiteKnowledgeItem[];
      summary: ScanRunSummary | null;
    }
  | {
      status: "manual";
      reason: "zero_fetch" | "blocked_by_site" | "timeout" | "unavailable" | "rejected";
      message: string;
      hostLine?: string;
    };

export type ScanAttemptPhase = "request" | "retry";

export type ScanAttemptProgress = {
  attempt: number;
  maxAttempts: number;
  phase: ScanAttemptPhase;
};

/** A silent call is aborted at 30 seconds and retried once with the same crawl id. */
export const SCAN_ATTEMPT_TIMEOUT_MS = 30_000;
/** A second attempt covers a dropped connection or a 5xx. Not a third full wait. */
export const SCAN_MAX_ATTEMPTS = 2;
export const SCAN_RETRY_BACKOFF_MS = 800;

export const SCAN_TIMEOUT_MESSAGE =
  "The website check took too long, so no business facts were filled in. Continue and complete the draft yourself. Nothing was invented.";

export const SCAN_UNAVAILABLE_MESSAGE =
  "The website check is unavailable just now, so no business facts were filled in. Continue and complete the draft yourself. Nothing was invented.";

export const SCAN_REJECTED_MESSAGE =
  "This website could not be checked, so no business facts were filled in. Continue and complete the draft yourself. Nothing was invented.";

/**
 * A durable crawl can return HTTP 200 with a PARTIAL manifest that fetched
 * nothing. That is a failed read, not an empty-but-successful draft.
 */
export const ZERO_FETCH_PARTIAL_MESSAGE =
  "The website check could not read any public pages, so no business facts were filled in. You can complete the draft yourself. Nothing was invented.";

/** Public address of the website scanner. A host can allow this GET source. */
export const SCANNER_PUBLIC_ADDRESS = "178.128.171.45";

export const BLOCKED_BY_SITE_MESSAGE =
  "This website blocks automated reading, so no business facts were filled in. You can carry on by typing the details yourself, or by pasting wording from the site into the draft. Nothing was invented.";

export const BLOCKED_BY_SITE_HOST_LINE =
  `If you look after this website, ask the host to allow HTTPS GET requests from the WorkSmartOS scanner at ${SCANNER_PUBLIC_ADDRESS}. The scanner identifies itself as WorkSmartOS-OnboardingScan and does not sign in.`;

/** Extra POSTs after the first response, while the crawl is still in progress. */
export const SCAN_AUTO_CONTINUE_LIMIT = 8;

export const LARGE_SITE_DISCOVERED_MIN = 40;

/** Keep reading while the scanner still has pages queued, up to a small limit. */
export function shouldAutoContinueScan(
  summary: ScanRunSummary | null,
  continues: number,
): boolean {
  if (!summary || continues >= SCAN_AUTO_CONTINUE_LIMIT) return false;
  if (summary.warnings.includes("scan_gateway_retry") || summary.warnings.includes("time_budget")) return true;
  return summary.state === "CRAWLING" && summary.fetched > 0;
}

export function scanContinueDetail(fetched: number): string {
  const pages = Number.isFinite(fetched) ? Math.max(0, Math.trunc(fetched)) : 0;
  return `Still reading your site (${pages} pages)`;
}

/** Shown when auto-continue stops before the crawl is finished. The draft already read stays on screen. */
export const SCAN_PARTIAL_NOTICE =
  "This check is partial. The draft from the pages already read is usable. You can continue and fill any gaps yourself.";

export type SuccessfulScanOutcome = Extract<ScanOutcome, { status: "ok" }>;

/** Count filled draft strings. The richest snapshot is the one with the most of these. */
export function filledScanDraftCount(draft: Partial<ReceptionistDraft>): number {
  let count = 0;
  for (const value of Object.values(draft)) {
    if (typeof value === "string" && value.trim()) count += 1;
  }
  return count;
}

function mergeScanSummary(
  current: ScanRunSummary | null,
  incoming: ScanRunSummary | null,
): ScanRunSummary | null {
  if (!current) return incoming;
  if (!incoming) return current;
  const gatewayEmpty =
    incoming.fetched === 0 && incoming.warnings.includes("scan_gateway_retry");
  if (gatewayEmpty && current.fetched > 0) {
    return {
      ...current,
      ...(incoming.crawlId ? { crawlId: incoming.crawlId } : {}),
      warnings: [...new Set([...current.warnings, "scan_gateway_retry"])],
    };
  }
  if (incoming.fetched >= current.fetched) return incoming;
  return {
    ...current,
    ...(incoming.crawlId ? { crawlId: incoming.crawlId } : {}),
  };
}

/**
 * Keep the draft with the most filled fields. An empty gateway retry must not wipe it.
 * Progress counts stay on the richer read, and a returned crawl id is kept for the next POST.
 */
export function chooseRicherScanOutcome(
  current: SuccessfulScanOutcome,
  incoming: SuccessfulScanOutcome,
): SuccessfulScanOutcome {
  const keepDraft = filledScanDraftCount(current.draft) > filledScanDraftCount(incoming.draft);
  const summary = mergeScanSummary(current.summary, incoming.summary);
  return { ...(keepDraft ? current : incoming), summary };
}

/** A large in-progress crawl should ask for a contact or services URL. */
export function largeSiteScanMessage(summary: ScanRunSummary | null): string | null {
  if (!summary || summary.state !== "CRAWLING" || summary.discovered < LARGE_SITE_DISCOVERED_MIN) {
    return null;
  }
  return "This is a large site. Paste the contact page or the services page URL so the check reads those pages instead of the site menu.";
}

export function thinHomePageMessage(summary: ScanRunSummary | null): string | null {
  if (!summary?.warnings.includes("thin_home_page")) return null;
  return "The home page did not include contact details. This check is partial. Paste the contact page URL, or fill the draft yourself.";
}

/** The review field shows the primary phone and one secondary number. */
export function reviewPhoneField(phones: readonly string[] | undefined): string {
  return (phones ?? []).map((phone) => phone.trim()).filter(Boolean).slice(0, 2).join(" / ");
}

/** Copy shown while /create is still waiting for the scanner. */
export function scanWaitProgressText(elapsedMs: number): string | null {
  if (elapsedMs < 8_000) return null;
  if (elapsedMs < 20_000) {
    return "Still reading the home page and the contact page. You can continue and fill in the draft yourself.";
  }
  if (elapsedMs < 35_000) {
    return "Still checking services, opening hours, and common questions. You can continue and fill in the draft yourself.";
  }
  return "Finishing a usable draft from the pages read so far. You can continue and fill any gaps yourself.";
}

export function scanAttemptDetail(event: ScanAttemptProgress): string {
  if (event.phase === "retry") {
    const next = Math.min(event.attempt + 1, event.maxAttempts);
    return `The website check did not finish. Trying again (attempt ${next} of ${event.maxAttempts}). You can continue and fill in the draft yourself.`;
  }
  return `Reading the public website (attempt ${event.attempt} of ${event.maxAttempts}). You can continue and fill in the draft yourself. Nothing is invented while this runs.`;
}

export function mapScanRunSummary(body: unknown): ScanRunSummary | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const scanner = (body as { scannerV2?: unknown }).scannerV2;
  if (!scanner || typeof scanner !== "object" || Array.isArray(scanner)) return null;
  const record = scanner as Record<string, unknown>;
  const state = typeof record.state === "string" ? record.state.trim() : "";
  const counts = ["discovered", "fetched", "unresolved"].map((key) => record[key]);
  if (!state || counts.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
    return null;
  }
  const [discovered, fetched, unresolved] = counts as number[];
  const warnings = Array.isArray((body as { warnings?: unknown }).warnings)
    ? (body as { warnings: unknown[] }).warnings.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const crawlId = typeof record.crawlId === "string" && record.crawlId.trim() ? record.crawlId.trim() : undefined;
  return crawlId
    ? { state, discovered, fetched, unresolved, warnings, crawlId }
    : { state, discovered, fetched, unresolved, warnings };
}

export function isBlockedBySite(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const record = body as {
    outcome?: unknown;
    warnings?: unknown;
    scannerV2?: { fetched?: unknown; state?: unknown };
  };
  if (record.outcome === "blocked_by_site") return true;
  if (record.scannerV2 && typeof record.scannerV2 === "object" && record.scannerV2.state === "BLOCKED") {
    return true;
  }
  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((item): item is string => typeof item === "string")
    : [];
  const fetched =
    record.scannerV2 && typeof record.scannerV2 === "object"
      ? record.scannerV2.fetched
      : undefined;
  if (fetched !== 0) return false;
  return (
    warnings.includes("blocked_by_site") ||
    warnings.includes("http_401") ||
    warnings.includes("http_403")
  );
}

export function isZeroFetchPartial(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const scanner = (body as { scannerV2?: unknown }).scannerV2;
  if (!scanner || typeof scanner !== "object") return false;
  const record = scanner as { state?: unknown; fetched?: unknown };
  return record.state === "PARTIAL" && record.fetched === 0;
}

const RETRYABLE_SCAN_STATUS = new Set([500, 502, 503, 504]);

export type OnboardingScanOptions = {
  timeoutMs?: number;
  maxAttempts?: number;
  backoffMs?: number;
  fetchImpl?: typeof fetch;
  onProgress?: (event: ScanAttemptProgress) => void;
  signal?: AbortSignal;
  sleep?: (ms: number) => Promise<void>;
  /** Resume the same durable crawl. The server still keys the job by the website URL. */
  crawlId?: string;
  followed?: boolean;
};

export function alternatePublicUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/\.$/, "");
  const nextHost = /^www\./i.test(host) ? host.replace(/^www\./i, "") : `www.${host}`;
  if (!nextHost || nextHost.toLowerCase() === host.toLowerCase()) return null;
  url.hostname = nextHost;
  return url.toString();
}

function hostOf(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function emptyDraftExplanation(summary: ScanRunSummary | null): string {
  const warnings = summary?.warnings ?? [];
  if (warnings.some((warning) => /could not resolve this hostname|dns_failed/i.test(warning))) {
    return "We could not find that website address. Check the spelling, or try it with or without www. Nothing was invented.";
  }
  if (warnings.some((warning) => /cross_origin_redirect/i.test(warning))) {
    return "This website sent the check to a different address. You can paste that address, or complete the draft yourself. Nothing was invented.";
  }
  if (summary?.state === "BLOCKED" || warnings.includes("blocked_by_site")) {
    return BLOCKED_BY_SITE_MESSAGE;
  }
  if (summary?.state === "PARTIAL") {
    return "The website check only read part of the site, so no business facts were filled in. You can complete the draft yourself. Nothing was invented.";
  }
  if (warnings.length > 0) {
    return "The website check finished with a warning, so no business facts were filled in. You can complete the draft yourself. Nothing was invented.";
  }
  return "No draft fields were supplied. Nothing was invented. You can complete the draft yourself.";
}

function publicFollowUrl(submitted: string, parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") return null;
  if (filledScanDraftCount(mapScanResponse(parsed)) > 0) return null;
  const record = parsed as { warnings?: unknown; sources?: unknown };
  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((item): item is string => typeof item === "string")
    : [];
  const sources = Array.isArray(record.sources) ? record.sources : [];
  for (const source of sources) {
    const raw = source && typeof source === "object" ? (source as { url?: unknown }).url : undefined;
    if (typeof raw !== "string" || !isAbsoluteHttpUrl(raw)) continue;
    if (hostOf(raw) && hostOf(raw) !== hostOf(submitted)) {
      try {
        return new URL(raw).toString();
      } catch {
        continue;
      }
    }
  }
  const interesting = warnings.some((warning) =>
    /cross_origin_redirect|could not resolve this hostname|dns_failed/i.test(warning),
  );
  if (!interesting) return null;
  const alternate = alternatePublicUrl(submitted);
  if (!alternate || hostOf(alternate) === hostOf(submitted) && alternate === submitted) return null;
  return alternate;
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Same id the scan function uses when the client has not learned a crawl id yet.
 * A no-response retry sends this id again so the durable crawl is resumed.
 */
export async function gatewayScanCrawlId(pageUrl: string): Promise<string> {
  let origin = pageUrl;
  try {
    origin = new URL(pageUrl).origin;
  } catch {
    origin = pageUrl;
  }
  const bytes = new TextEncoder().encode(`${origin.replace(/\r\n?/g, "\n")}\0`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `scanner-v2:gateway:${hex}`;
}

/**
 * POST the same-origin scanner. A 5xx or a timed-out attempt is retried once.
 * Zero-fetch, timeout, and a failed retry all return `manual` so the visitor
 * can finish the draft. Nothing is invented.
 */
export async function requestOnboardingScan(
  endpoint: string,
  url: string,
  options: OnboardingScanOptions = {},
): Promise<ScanOutcome> {
  const trimmed = endpoint.trim();
  if (!trimmed) return { status: "disabled" };
  const sameOriginPath = trimmed.startsWith("/") && !trimmed.startsWith("//");
  if (!sameOriginPath && !isAbsoluteHttpUrl(trimmed)) {
    return {
      status: "manual",
      reason: "rejected",
      message: SCAN_REJECTED_MESSAGE,
    };
  }

  const timeoutMs = options.timeoutMs ?? SCAN_ATTEMPT_TIMEOUT_MS;
  const maxAttempts = Math.max(1, options.maxAttempts ?? SCAN_MAX_ATTEMPTS);
  const backoffMs = options.backoffMs ?? SCAN_RETRY_BACKOFF_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? sleepMs;
  const crawlId = options.crawlId?.trim() || (await gatewayScanCrawlId(url));
  let lastManual: Extract<ScanOutcome, { status: "manual" }> = {
    status: "manual",
    reason: "unavailable",
    message: SCAN_UNAVAILABLE_MESSAGE,
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) return { status: "aborted" };
    options.onProgress?.({ attempt, maxAttempts, phase: "request" });

    const controller = new AbortController();
    const onAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onAbort);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let retry = false;
    try {
      const res = await fetchImpl(trimmed, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          url,
          crawlId,
        }),
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
      if (
        res.status === 202 ||
        (parsed === null && /not yet ready/i.test(text))
      ) {
        return {
          status: "ok",
          draft: {},
          fieldMeta: {},
          facts: {},
          factMeta: {},
          siteKnowledge: [],
          summary: {
            state: "CRAWLING",
            discovered: 0,
            fetched: 0,
            unresolved: 0,
            warnings: ["scan_gateway_retry"],
            crawlId,
          },
        };
      }
      if (res.ok) {
        if (!options.followed) {
          const nextUrl = publicFollowUrl(url, parsed);
          if (nextUrl) {
            return requestOnboardingScan(endpoint, nextUrl, {
              ...options,
              crawlId: undefined,
              followed: true,
            });
          }
        }
        if (isBlockedBySite(parsed)) {
          return {
            status: "manual",
            reason: "blocked_by_site",
            message: BLOCKED_BY_SITE_MESSAGE,
            hostLine: BLOCKED_BY_SITE_HOST_LINE,
          };
        }
        if (isZeroFetchPartial(parsed)) {
          const summary = mapScanRunSummary(parsed);
          const explained = emptyDraftExplanation(summary);
          const hostnameOrRedirect = (summary?.warnings ?? []).some((warning) =>
            /could not resolve this hostname|dns_failed|cross_origin_redirect/i.test(warning),
          );
          return {
            status: "manual",
            reason: "zero_fetch",
            message: hostnameOrRedirect ? explained : ZERO_FETCH_PARTIAL_MESSAGE,
          };
        }
        const facts = mapScanBusinessFacts(parsed);
        return {
          status: "ok",
          draft: mapScanResponse(parsed),
          fieldMeta: mapScanFieldMeta(parsed),
          facts,
          factMeta: mapScanBusinessFactMeta(parsed, facts),
          siteKnowledge: mapScanSiteKnowledge(parsed),
          summary: mapScanRunSummary(parsed),
        };
      }
      const retryable = RETRYABLE_SCAN_STATUS.has(res.status);
      lastManual = {
        status: "manual",
        reason: retryable ? "unavailable" : "rejected",
        message: retryable ? SCAN_UNAVAILABLE_MESSAGE : SCAN_REJECTED_MESSAGE,
      };
      retry = retryable && attempt < maxAttempts;
    } catch {
      if (options.signal?.aborted) return { status: "aborted" };
      const timedOut = controller.signal.aborted;
      lastManual = {
        status: "manual",
        reason: timedOut ? "timeout" : "unavailable",
        message: timedOut ? SCAN_TIMEOUT_MESSAGE : SCAN_UNAVAILABLE_MESSAGE,
      };
      retry = attempt < maxAttempts;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    }
    if (!retry) return lastManual;
    options.onProgress?.({ attempt, maxAttempts, phase: "retry" });
    await sleep(backoffMs);
  }
  return lastManual;
}

export function buildCreateLeadMessage(input: {
  businessUrl: string;
  draft: ReceptionistDraft;
  scanNote: string;
  fieldMeta?: ScanDraftFieldMeta;
  factMeta?: ScanBusinessFactMeta;
  review?: {
    version: string;
    revisionId: string;
    complete: boolean;
    requiredIds: string[];
    confirmedIds: string[];
    missingIds: string[];
  };
  sandboxQualification?: {
    version: string;
    reviewRevisionId: string;
    source: string;
    sessionId: string;
    testId: string;
    complete: boolean;
    checks: Array<{ id: string; ok: boolean }>;
    failedCheckIds: string[];
  };
  agentBlueprint?: unknown;
  receptionist?: {
    knowledgePack: unknown;
    systemPrompt: string;
    limitations: string[];
  } | null;
}): string {
  const parts = [
    "Website-to-AI-agent early access request.",
    `Business URL: ${input.businessUrl}`,
    `Scan: ${input.scanNote}`,
    "Draft JSON:",
    JSON.stringify(input.draft, null, 2),
  ];
  if (input.fieldMeta && Object.keys(input.fieldMeta).length) {
    parts.push("Field meta JSON:", JSON.stringify(input.fieldMeta, null, 2));
  }
  if (input.factMeta && Object.keys(input.factMeta).length) {
    parts.push("Fact meta JSON:", JSON.stringify(input.factMeta, null, 2));
  }
  if (input.review) {
    parts.push("Customer review JSON:", JSON.stringify(input.review, null, 2));
  }
  if (input.sandboxQualification) {
    parts.push(
      "Sandbox qualification JSON:",
      JSON.stringify(input.sandboxQualification, null, 2),
    );
  }
  if (input.agentBlueprint) {
    parts.push("Agent blueprint JSON:", JSON.stringify(input.agentBlueprint, null, 2));
  }
  if (input.receptionist) {
    parts.push(
      "Agent knowledge pack JSON:",
      JSON.stringify(input.receptionist.knowledgePack, null, 2),
      "System prompt draft:",
      input.receptionist.systemPrompt,
      "Limitations:",
      JSON.stringify(input.receptionist.limitations, null, 2),
    );
  }
  return parts.join("\n");
}
