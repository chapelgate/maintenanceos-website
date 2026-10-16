import {
  acceptableFaqAnswer,
  assessOpeningHours,
  chooseOpeningHours,
  chooseProminentAddress,
  cleanFaqAnswer,
  chooseProminentEmail,
  chooseProminentPhones,
  crawlUrlPriority,
  isServicePhrase,
  phoneIdentity,
  sanitizeUntrustedField,
  serviceAreaNames,
  townFromAddress,
  type ProminentHit,
} from "./extract.ts";
import {
  DEFAULT_MAX_REDIRECTS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractScannerV2Page } from "./scanner-v2-content.ts";
import {
  discoverHtmlLinks,
  discoverScannerV2Frontier,
  type ScannerV2DiscoveryOptions,
} from "./scanner-v2-discovery.ts";
import {
  ingestScannerV2Document,
  isScannerV2SupportedDocumentUrl,
  isScannerV2UnsupportedTextDocumentUrl,
} from "./scanner-v2-documents.ts";
import {
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import {
  recoverAuthBlockedDocument,
  type BrowserDocumentFetch,
} from "./scanner-v2-browser-fetch.ts";
import {
  decideScannerV2RenderEscalation,
  renderScannerV2Page,
} from "./scanner-v2-renderer.ts";
import {
  DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
  DEFAULT_MAX_PATH_DEPTH,
  DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
  extractScannerV2CanonicalLink,
  ScannerV2FrontierTrapGuard,
} from "./scanner-v2-url-policy.ts";
import {
  FileScannerV2JobStore,
  createScannerV2Job,
  runScannerV2WorkerBatch,
  type ScannerV2JobStore,
  type ScannerV2ProcessUrl,
} from "./scanner-v2-worker.ts";
import { allowPublicHttpsUrl, sameRegistrableSite } from "./ssrf.ts";
import { siteBlockedScan, warningsWithSiteBlock } from "./site-block.ts";
import {
  isPathAllowed,
  isReaderChallengePage,
  parseRobotsTxt,
  READER_FALLBACK_MAX_BYTES,
  READER_FALLBACK_ORIGIN,
  READER_FALLBACK_TIMEOUT_MS,
} from "./scan.ts";
import {
  ScanError,
  type BusinessFactMeta,
  type BusinessFacts,
  type CorpusChunk,
  type CrawlManifest,
  type CrawlPage,
  type CrawlState,
  type CrawlUrlDisposition,
  type HttpGetFn,
  type LookupFn,
  type ScanResult,
  type SafeHttpResponse,
} from "./types.ts";

export const DEFAULT_SCANNER_V2_STATE_ROOT = ".data/scanner-v2";
export const DEFAULT_SCANNER_V2_REQUEST_MS = 18_000;
export const MAX_SCANNER_V2_REQUEST_MS = 115_000;
/** Robots.txt is part of the request budget, not a fixed 5s wait before it. */
export const SCANNER_V2_ROBOTS_BUDGET_MS = 2_000;
/** PDF and office-text parsing gets a short slice, then the crawl moves on. */
export const SCANNER_V2_DOCUMENT_PARSE_SLICE_MS = 3_000;
/** Leave time to read the persisted crawl and build the partial before the budget ends. */
export const SCANNER_V2_RESULT_RESERVE_MS = 2_000;
/** In-flight sockets are destroyed at this age so a slow drip cannot outlive the response. */
export const SCANNER_V2_FETCH_ABORT_MS = 17_000;
/** A discovered frontier above this is not stored. Key pages can replace a low-priority URL. */
export const MAX_ADMITTED_CRAWL_URLS = 60;
const MAX_NON_KEY_ADMISSIONS = 12;

const QUIET_CRAWL_REASONS = new Set([
  "document_parse_timeout",
  "document_parse_failed",
  "unsupported_document",
  "response_too_large",
  "frontier_capped",
]);

/** Parse failures and finished policy skips are terminal. Other fetch errors stay retryable. */
export function documentCrawlDisposition(document: {
  ok: false;
  incomplete?: boolean;
  reason: string;
}): { disposition: "policy_skipped" | "unresolved"; reason: string } {
  if (QUIET_CRAWL_REASONS.has(document.reason) || document.incomplete === false) {
    return { disposition: "policy_skipped", reason: document.reason };
  }
  return { disposition: "unresolved", reason: document.reason };
}
export const DEFAULT_SCANNER_V2_BATCH_SIZE = 8;
export const MAX_SCANNER_V2_URLS = 10_000;
export const MAX_SCANNER_V2_HTML_BYTES = 2 * 1024 * 1024;
export const MAX_SCANNER_V2_KNOWLEDGE_ITEMS = 200;
export const MAX_SCANNER_V2_KNOWLEDGE_CHARS = 300_000;

type RuntimeKnowledgeItem = {
  url: string;
  title?: string;
  headingPath: string[];
  text: string;
  contentHash: string;
};

type RuntimeSummary = {
  crawlId: string;
  state: CrawlState;
  discovered: number;
  fetched: number;
  unresolved: number;
  knowledgeChunks: number;
  resumed: boolean;
};

export type ScannerV2RuntimeSuccess = Extract<ScanResult, { ok: true }> & {
  knowledge?: RuntimeKnowledgeItem[];
  scannerV2: RuntimeSummary;
};

export type ScannerV2RuntimeOptions = {
  stateRoot?: string;
  releaseSha?: string;
  requestMs?: number;
  batchSize?: number;
  store?: ScannerV2JobStore;
  discover?: typeof discoverScannerV2Frontier;
  processUrl?: ScannerV2ProcessUrl;
  discoveryOptions?: ScannerV2DiscoveryOptions;
  now?: () => number;
};

function boundedInt(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(value as number)));
}

function responseContentType(headers: Record<string, string>): string {
  const value = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "content-type",
  )?.[1];
  return (value ?? "").split(";", 1)[0]!.trim().toLowerCase();
}

function isHtmlOrText(type: string): boolean {
  return (
    !type ||
    type === "text/html" ||
    type === "application/xhtml+xml" ||
    type === "text/plain"
  );
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function asFieldSource(source: string | undefined): ProminentHit["source"] {
  switch (source) {
    case "jsonld":
    case "microdata":
    case "meta":
    case "title":
    case "heading":
    case "footer":
    case "nav":
    case "pattern":
    case "contact_link":
    case "details":
      return source;
    default:
      return "heading";
  }
}

function sourceRank(source: string | undefined): number {
  if (source === "footer") return 7;
  if (source === "jsonld" || source === "microdata") return 5;
  if (source === "contact_link") return 4;
  if (source === "heading") return 3;
  if (source === "pattern") return 1;
  return 2;
}

function factsAreUseful(facts: BusinessFacts): boolean {
  if (facts.address?.trim()) return true;
  if (facts.hours?.trim()) return true;
  if (facts.services?.length) return true;
  if (facts.contact?.phones?.some((phone) => phone.trim())) return true;
  if (facts.contact?.emails?.some((email) => email.trim())) return true;
  return false;
}

const THIN_HOME_PROBE_PATHS = [
  "/contact",
  "/contact-us",
  "/about",
  "/about-us",
  "/services",
  "/our-services",
  "/faq",
  "/opening-hours",
  "/times",
  "/prices",
  "/price-list",
];

function pathnameKey(raw: string): string {
  try {
    const path = new URL(raw).pathname.replace(/\/+$/, "");
    return path || "/";
  } catch {
    return "";
  }
}

function pageHasUsefulFacts(page: CrawlPage): boolean {
  const facts = page.structuredFacts as Partial<BusinessFacts>;
  const phones = Array.isArray(facts.contact?.phones)
    ? facts.contact.phones.filter((item): item is string => typeof item === "string")
    : [];
  const emails = Array.isArray(facts.contact?.emails)
    ? facts.contact.emails.filter((item): item is string => typeof item === "string")
    : [];
  return factsAreUseful({
    ...(typeof facts.address === "string" ? { address: facts.address } : {}),
    ...(typeof facts.hours === "string" ? { hours: facts.hours } : {}),
    ...(Array.isArray(facts.services)
      ? { services: facts.services.filter((item): item is string => typeof item === "string") }
      : {}),
    contact: { phones, emails },
  });
}

async function enqueueThinHomeProbes(
  store: ScannerV2JobStore,
  crawlId: string,
  origin: string,
): Promise<number> {
  const existing = await store.listUrls(crawlId);
  const known = new Set(existing.map((row) => pathnameKey(row.url)));
  const base = origin.endsWith("/") ? origin : `${origin}/`;
  let added = 0;
  for (const probe of THIN_HOME_PROBE_PATHS) {
    if (known.has(probe)) continue;
    await store.upsertUrl(crawlId, {
      url: new URL(probe, base).toString(),
      status: "queued",
      discoveryReason: "html_link",
      discoveredFrom: new URL("/", base).toString(),
      retryCount: 0,
    });
    added += 1;
  }
  return added;
}

function aggregateFacts(
  origin: string,
  pages: readonly CrawlPage[],
): { facts: BusinessFacts; factMeta: BusinessFactMeta } {
  const facts: BusinessFacts = { website: origin };
  const factMeta: BusinessFactMeta = {
    website: { confidence: "high", source: "fetched_url" },
  };
  const locations: string[] = [];
  const services: string[] = [];
  const faqs: Array<{ question: string; answer: string }> = [];
  const phoneHits: ProminentHit[] = [];
  const emailHits: ProminentHit[] = [];
  const addressHits: ProminentHit[] = [];
  const hourHits: ProminentHit[] = [];
  const pageUrls = pages.map((page) => page.canonicalUrl);

  for (const page of pages) {
    const source = page.structuredFacts as Partial<BusinessFacts> & {
      _factMeta?: BusinessFactMeta;
    };
    const pageMeta = source._factMeta;
    if (!facts.businessName && typeof source.businessName === "string") {
      facts.businessName = sanitizeUntrustedField(source.businessName, 200);
      if (pageMeta?.businessName) factMeta.businessName = pageMeta.businessName;
    }
    if (typeof source.address === "string" && source.address.trim()) {
      const meta = pageMeta?.address;
      addressHits.push({
        value: source.address,
        url: page.canonicalUrl,
        rank: meta && "source" in meta ? sourceRank(meta.source) : 2,
        source: asFieldSource(meta && "source" in meta ? meta.source : undefined),
        confidence: meta && "confidence" in meta ? meta.confidence : "medium",
      });
    }
    if (typeof source.hours === "string" && source.hours.trim()) {
      const meta = pageMeta?.hours;
      hourHits.push({
        value: source.hours,
        url: page.canonicalUrl,
        rank: meta && "source" in meta ? sourceRank(meta.source) : 2,
        source: asFieldSource(meta && "source" in meta ? meta.source : undefined),
        confidence: meta && "confidence" in meta ? meta.confidence : "medium",
      });
    }
    if (Array.isArray(source.locations)) {
      locations.push(...source.locations.map((item) => sanitizeUntrustedField(item, 80)));
      if (!factMeta.locations && pageMeta?.locations) factMeta.locations = pageMeta.locations;
    }
    if (Array.isArray(source.services)) {
      services.push(...source.services);
      if (!factMeta.services && pageMeta?.services) factMeta.services = pageMeta.services;
    }
    const contactMeta = pageMeta?.contact;
    const contactRank = contactMeta && "source" in contactMeta ? sourceRank(contactMeta.source) : 2;
    const contactSource = asFieldSource(contactMeta && "source" in contactMeta ? contactMeta.source : undefined);
    const contactConfidence =
      contactMeta && "confidence" in contactMeta ? contactMeta.confidence : "medium";
    if (Array.isArray(source.contact?.phones)) {
      for (const phone of source.contact.phones) {
        phoneHits.push({
          value: phone,
          url: page.canonicalUrl,
          rank: contactRank,
          source: contactSource,
          confidence: contactConfidence,
        });
      }
    }
    if (Array.isArray(source.contact?.emails)) {
      for (const email of source.contact.emails) {
        emailHits.push({
          value: email,
          url: page.canonicalUrl,
          rank: contactRank,
          source: contactSource,
          confidence: contactConfidence,
        });
      }
    }
    if (Array.isArray(source.faqs)) {
      for (const faq of source.faqs) {
        if (
          faq &&
          typeof faq.question === "string" &&
          typeof faq.answer === "string" &&
          faq.question.includes("?") &&
          acceptableFaqAnswer(faq.answer)
        ) {
          faqs.push({
            question: sanitizeUntrustedField(faq.question, 200),
            answer: cleanFaqAnswer(faq.answer),
          });
        }
      }
    }
  }

  const phonePicks = chooseProminentPhones(phoneHits, pageUrls, 2);
  const phonePick = phonePicks[0];
  let emailHost = "";
  try {
    emailHost = new URL(origin).hostname;
  } catch {
    emailHost = "";
  }
  const emailPick = chooseProminentEmail(emailHits, pageUrls, emailHost);
  const addressPick = chooseProminentAddress(addressHits, pageUrls);
  const hourPick = chooseOpeningHours(hourHits, pageUrls);
  const hoursAssessment = hourPick
    ? assessOpeningHours(hourPick.value, hourHits.map((hit) => hit.value).join("\n"))
    : undefined;
  const uniqueServices = unique(services.map((item) => sanitizeUntrustedField(item, 80)))
    .filter((item) => isServicePhrase(item))
    .slice(0, 12);
  const uniqueFaqs = [
    ...new Map(
      faqs.map((faq) => [
        faq.question.trim() + "\u0000" + faq.answer.trim(),
        { question: faq.question.trim(), answer: faq.answer.trim() },
      ]),
    ).values(),
  ];

  if (phonePick || emailPick) {
    facts.contact = {
      ...(phonePicks.length ? { phones: phonePicks.map((hit) => hit.value) } : {}),
      ...(emailPick ? { emails: [emailPick.value] } : {}),
    };
    const contactHit = [phonePick, emailPick]
      .filter((hit): hit is ProminentHit => Boolean(hit))
      .sort((a, b) => b.rank - a.rank)[0];
    if (contactHit) {
      factMeta.contact = {
        source: contactHit.source,
        confidence:
          phonePick?.confidence === "low" || emailPick?.confidence === "low"
            ? "low"
            : contactHit.confidence,
        ...(contactHit.url.startsWith("https://") ? { sourceUrl: contactHit.url } : {}),
      };
    }
  }
  if (addressPick) {
    facts.address = addressPick.value;
    factMeta.address = {
      source: addressPick.source,
      confidence: addressPick.confidence,
      ...(addressPick.url.startsWith("https://") ? { sourceUrl: addressPick.url } : {}),
    };
  }
  const namedLocations = serviceAreaNames(locations);
  let locationList = namedLocations;
  if (!locationList.length && addressPick) {
    const town = townFromAddress(addressPick.value);
    if (town) {
      locationList = [town];
      factMeta.locations = {
        source: addressPick.source,
        confidence: "low",
        ...(addressPick.url.startsWith("https://") ? { sourceUrl: addressPick.url } : {}),
      };
    }
  }
  if (locationList.length) facts.locations = locationList;
  else delete factMeta.locations;
  if (hourPick && hoursAssessment) {
    facts.hours = hoursAssessment.value;
    factMeta.hours = {
      source: hourPick.source,
      confidence: hoursAssessment.partial ? "low" : hourPick.confidence,
      ...(hourPick.url.startsWith("https://") ? { sourceUrl: hourPick.url } : {}),
    };
  }
  if (uniqueServices.length) facts.services = uniqueServices;
  if (uniqueFaqs.length) facts.faqs = uniqueFaqs;
  return { facts, factMeta };
}

function draftFromFacts(facts: BusinessFacts) {
  return {
    ...(facts.businessName ? { businessName: facts.businessName } : {}),
    ...(facts.hours ? { hours: facts.hours } : {}),
    ...(facts.services?.length ? { services: facts.services.join("\n") } : {}),
    ...(facts.faqs?.length
      ? {
          faqs: facts.faqs
            .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
            .join("\n\n"),
        }
      : {}),
  };
}

function knowledgeFromChunks(chunks: readonly CorpusChunk[]): RuntimeKnowledgeItem[] {
  const out: RuntimeKnowledgeItem[] = [];
  let chars = 0;
  for (const chunk of chunks) {
    if (
      out.length >= MAX_SCANNER_V2_KNOWLEDGE_ITEMS ||
      chars >= MAX_SCANNER_V2_KNOWLEDGE_CHARS
    ) {
      break;
    }
    const remaining = MAX_SCANNER_V2_KNOWLEDGE_CHARS - chars;
    const text = chunk.text.trim().slice(0, remaining);
    if (!text) continue;
    out.push({
      url: chunk.canonicalUrl,
      ...(chunk.title ? { title: chunk.title } : {}),
      headingPath: [...chunk.headingPath],
      text,
      contentHash: chunk.contentHash,
    });
    chars += text.length;
  }
  return out;
}

function crawlIdFor(origin: string, releaseSha: string): string {
  return `scanner-v2:${releaseSha}:${stableContentHash(origin)}`;
}

async function fetchRobotsRules(origin: URL, timeoutMs = SCANNER_V2_ROBOTS_BUDGET_MS) {
  const budget = Math.max(250, Math.min(SCANNER_V2_ROBOTS_BUDGET_MS, timeoutMs));
  try {
    const response = await fetchPublicHttps(new URL("/robots.txt", origin).toString(), {
      timeoutMs: budget,
      maxBytes: 64 * 1024,
      maxRedirects: 2,
    });
    if (response.status >= 400) return parseRobotsTxt("");
    return parseRobotsTxt(response.body);
  } catch {
    return parseRobotsTxt("");
  }
}

export async function recoverScannerV2ReaderPage(
  targetUrl: string,
  options: {
    lookup?: LookupFn;
    get?: HttpGetFn;
    timeoutMs?: number;
  } = {},
): Promise<SafeHttpResponse | null> {
  const allowed = allowPublicHttpsUrl(targetUrl);
  if (!allowed.ok) return null;

  const budget = Math.min(
    READER_FALLBACK_TIMEOUT_MS,
    Math.max(250, options.timeoutMs ?? READER_FALLBACK_TIMEOUT_MS),
  );
  const readerDeadline = Date.now() + budget;
  const readerUrl = `${READER_FALLBACK_ORIGIN}/${allowed.url.toString()}`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const left = readerDeadline - Date.now();
    if (left < 250) return null;
    let reader: SafeHttpResponse;
    try {
      reader = await fetchPublicHttps(readerUrl, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: left,
        maxBytes: READER_FALLBACK_MAX_BYTES,
        maxRedirects: 2,
        headers: {
          Accept: "text/html",
          "X-Respond-With": "html",
          "X-No-Cache": "true",
        },
      });
    } catch {
      return null;
    }

    if (reader.status >= 400) return null;
    if (!/<(?:html|head|body)\b/i.test(reader.body)) return null;
    if (isReaderChallengePage(reader.body)) {
      if (attempt === 0) continue;
      return null;
    }

    return {
      ...reader,
      status: 200,
      url: new URL(allowed.url.toString()),
      headers: {
        ...reader.headers,
        "content-type": "text/html; charset=utf-8",
      },
    };
  }

  return null;
}

async function buildDefaultProcessor(input: {
  store: ScannerV2JobStore;
  crawlId: string;
  origin: URL;
  lookup?: LookupFn;
  get?: HttpGetFn;
  browserDocumentFetch?: BrowserDocumentFetch;
  pageBudgetMs?: () => number;
  signal?: AbortSignal;
}): Promise<ScannerV2ProcessUrl> {
  const pageBudgetMs = () => Math.max(250, Math.min(8_000, input.pageBudgetMs?.() ?? 8_000));
  const robots = await fetchRobotsRules(input.origin, pageBudgetMs());
  const trapGuard = new ScannerV2FrontierTrapGuard({
    maxQueryVariantsPerSignature: DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
    maxCalendarVariantsPerFamily: DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
  });

  for (const row of await input.store.listUrls(input.crawlId)) {
    try {
      trapGuard.evaluate(row.url);
    } catch {
      // Existing durable rows are authoritative. Trap state only constrains new links.
    }
  }

  const admitLinks = async (
    links: readonly CrawlUrlDisposition[],
  ): Promise<void> => {
    let count = (await input.store.listUrls(input.crawlId)).length;
    for (const row of links) {
      if (count >= MAX_ADMITTED_CRAWL_URLS) break;
      if (await input.store.getUrl(input.crawlId, row.url)) continue;
      if (crawlUrlPriority(row.url) < 50) {
        const stored = await input.store.listUrls(input.crawlId);
        const nonKey = stored.filter((item) => crawlUrlPriority(item.url) < 50).length;
        if (nonKey >= MAX_NON_KEY_ADMISSIONS) continue;
      }

      let parsed: URL;
      try {
        parsed = new URL(row.url);
      } catch {
        continue;
      }
      if (!isPathAllowed(robots, parsed.pathname || "/")) {
        await input.store.upsertUrl(input.crawlId, {
          ...row,
          status: "robots_skipped",
          reason: "robots_disallow",
        });
        count += 1;
        continue;
      }

      const trap = trapGuard.evaluate(row.url);
      if (!trap.ok) {
        await input.store.upsertUrl(input.crawlId, {
          ...row,
          status: "unresolved",
          reason: trap.reason,
        });
        count += 1;
        continue;
      }

      await input.store.upsertUrl(input.crawlId, row);
      count += 1;
    }
  };

  return async ({ url }) => {
    let parsed: URL;
    try {
      parsed = new URL(url.url);
    } catch {
      return { disposition: "unresolved", reason: "invalid_url" };
    }

    if (!isPathAllowed(robots, parsed.pathname || "/")) {
      return { disposition: "robots_skipped", reason: "robots_disallow" };
    }

    if (isScannerV2UnsupportedTextDocumentUrl(url.url)) {
      return { disposition: "policy_skipped", reason: "unsupported_document" };
    }

    if (isScannerV2SupportedDocumentUrl(url.url)) {
      const parseBudget = Math.max(
        250,
        Math.min(SCANNER_V2_DOCUMENT_PARSE_SLICE_MS, pageBudgetMs()),
      );
      const document = await ingestScannerV2Document(url.url, {
        origin: input.origin.origin,
        fetchTimeoutMs: pageBudgetMs(),
        parseTimeoutMs: parseBudget,
        ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
      });
      if (!document.ok) {
        return documentCrawlDisposition(document);
      }
      return {
        disposition: document.complete ? "fetched" : "unresolved",
        ...(document.complete ? {} : { reason: "document_limit_reached" }),
        canonicalUrl: document.page.canonicalUrl,
        page: document.page,
        chunks: document.chunks,
      };
    }

    let response: SafeHttpResponse;
    let readerRecovered = false;
    try {
      response = await fetchPublicHttps(url.url, {
        lookup: input.lookup,
        get: input.get,
        timeoutMs: pageBudgetMs(),
        maxBytes: MAX_SCANNER_V2_HTML_BYTES,
        maxDecompressedBytes: MAX_SCANNER_V2_HTML_BYTES,
        acceptCompressed: true,
        maxRedirects: DEFAULT_MAX_REDIRECTS,
        signal: input.signal,
      });
    } catch (directError) {
      if (directError instanceof ScanError && directError.code === "response_too_large") {
        return { disposition: "policy_skipped", reason: "response_too_large" };
      }
      const readerBudget = pageBudgetMs();
      const reader =
        !input.signal?.aborted && readerBudget >= 250
          ? await recoverScannerV2ReaderPage(url.url, { timeoutMs: readerBudget })
          : null;
      if (!reader) throw directError;
      response = reader;
      readerRecovered = true;
    }

    let browserRecovered = false;
    if (
      !readerRecovered &&
      !input.signal?.aborted &&
      (response.status === 401 || response.status === 403)
    ) {
      const recovered = await recoverAuthBlockedDocument({
        pageUrl: url.url,
        response,
        timeoutMs: pageBudgetMs(),
        browserDocumentFetch: input.browserDocumentFetch,
        allowPlaywrightLaunch: !input.get,
      });
      if (recovered.usedBrowser) {
        response = recovered.response;
        browserRecovered = true;
      }
    }

    if (!sameRegistrableSite(response.url, input.origin)) {
      return { disposition: "policy_skipped", reason: "cross_origin_redirect" };
    }
    if (response.status === 404 || response.status === 410) {
      return {
        disposition: "policy_skipped",
        reason: `http_${response.status}`,
      };
    }
    if (response.status >= 400) {
      return {
        disposition: "unresolved",
        reason: `http_${response.status}`,
      };
    }

    const type = responseContentType(response.headers);
    if (!isHtmlOrText(type)) {
      return {
        disposition: "policy_skipped",
        reason: "content_type_not_supported",
      };
    }

    let body = response.body;
    let finalUrl = response.url.toString();
    let fetchMode: "http" | "rendered" | "reader" = readerRecovered
      ? "reader"
      : browserRecovered
        ? "rendered"
        : "http";
    let renderedLinks: CrawlUrlDisposition[] = [];

    if (type !== "text/plain" && !readerRecovered && !browserRecovered && !input.signal?.aborted) {
      const renderDecision = decideScannerV2RenderEscalation({ rawHtml: body });
      const renderBudget = pageBudgetMs();
      if (renderDecision.render && renderBudget >= 500) {
        const rendered = await renderScannerV2Page(url.url, {
          rawHtml: body,
          timeoutMs: renderBudget,
        });
        if (!rendered.ok) {
          throw new Error(rendered.reason);
        }
        body = rendered.html;
        finalUrl = rendered.finalUrl;
        fetchMode = "rendered";
        renderedLinks = rendered.links;
      }
    }

    let canonicalUrl = finalUrl;
    if (type !== "text/plain") {
      const canonical = extractScannerV2CanonicalLink({
        html: body,
        pageUrl: finalUrl,
        origin: input.origin.origin,
        maxPathDepth: DEFAULT_MAX_PATH_DEPTH,
      });
      if (canonical?.ok) canonicalUrl = canonical.url;
    }

    if (type !== "text/plain") {
      await admitLinks([
        ...discoverHtmlLinks({
          html: body,
          pageUrl: finalUrl,
          origin: input.origin.origin,
          maxPathDepth: DEFAULT_MAX_PATH_DEPTH,
        }),
        ...renderedLinks,
      ]);
    }

    const extracted = extractScannerV2Page({
      requestedUrl: url.url,
      canonicalUrl,
      html: body,
      contentType: type || "text/html",
      fetchMode,
      ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
      headers: response.headers,
    });

    return {
      disposition: "fetched",
      canonicalUrl: extracted.page.canonicalUrl,
      page: extracted.page,
      chunks: extracted.chunks,
    };
  };
}

async function seedJob(input: {
  store: ScannerV2JobStore;
  crawlId: string;
  origin: URL;
  submittedUrl: string;
  releaseSha: string;
  discover: typeof discoverScannerV2Frontier;
  discoveryOptions?: ScannerV2DiscoveryOptions;
}): Promise<void> {
  const discovered = await input.discover(input.submittedUrl, {
    ...input.discoveryOptions,
    maxHtmlPages: 1,
    maxSitemapDocuments: input.discoveryOptions?.maxSitemapDocuments ?? 3,
    maxSitemapDepth: input.discoveryOptions?.maxSitemapDepth ?? 1,
    sitemapTimeoutMs: input.discoveryOptions?.sitemapTimeoutMs ?? 2_500,
    maxDiscoveredUrls: input.discoveryOptions?.maxDiscoveredUrls ?? MAX_ADMITTED_CRAWL_URLS,
  });

  const rows = discovered.manifest.urls.map((row) => {
    if (row.status === "fetched" || row.status === "unresolved") {
      return {
        ...row,
        status: "queued" as const,
        reason: undefined,
        retryCount: 0,
      };
    }
    return row;
  });

  if (!rows.some((row) => row.url === input.submittedUrl)) {
    rows.push({
      url: input.submittedUrl,
      status: "queued",
      discoveryReason: "submitted",
      retryCount: 0,
    });
  }

  await createScannerV2Job({
    store: input.store,
    crawlId: input.crawlId,
    origin: input.origin.origin,
    releaseSha: input.releaseSha,
    urls: rows,
  });
}

async function runtimeResult(input: {
  store: ScannerV2JobStore;
  crawlId: string;
  origin: string;
  resumed: boolean;
}): Promise<ScannerV2RuntimeSuccess> {
  const job = await input.store.getJob(input.crawlId);
  if (!job) throw new Error("scanner_v2_job_not_found");
  const pages = await input.store.listPages(input.crawlId);
  const chunks = await input.store.listChunks(input.crawlId);
  const urls = await input.store.listUrls(input.crawlId);
  const manifest: CrawlManifest = {
    crawlId: input.crawlId,
    origin: input.origin,
    state: job.state,
    discovered: urls.length,
    queued: urls.filter((row) => row.status === "queued").length,
    fetched: urls.filter((row) => row.status === "fetched").length,
    duplicate: urls.filter((row) => row.status === "duplicate").length,
    policySkipped: urls.filter((row) => row.status === "policy_skipped").length,
    robotsSkipped: urls.filter((row) => row.status === "robots_skipped").length,
    unresolved: urls.filter((row) => row.status === "unresolved").length,
    urls,
  };
  const aggregated = aggregateFacts(input.origin, pages);
  const facts = aggregated.facts;
  const knowledge = knowledgeFromChunks(chunks);
  let state: CrawlState = manifest.state;
  const warnings = unique([
    ...urls
      .filter(
        (row) =>
          (row.status === "unresolved" ||
            row.status === "policy_skipped" ||
            row.status === "robots_skipped") &&
          row.reason &&
          !QUIET_CRAWL_REASONS.has(row.reason),
      )
      .map((row) => row.reason as string),
    ...(pages.some((page) => page.fetchMode === "reader")
      ? ["reader_fallback_used"]
      : []),
    ...(state === "CRAWLING" ? ["scanner_v2_in_progress"] : []),
    ...(state === "PARTIAL" ? ["scanner_v2_partial"] : []),
  ]);
  const emptyPages =
    pages.length > 0 && pages.every((page) => page.visibleText.trim().length < 40);
  if (manifest.fetched > 0 && state === "COMPLETE" && !factsAreUseful(facts)) {
    state = "PARTIAL";
    warnings.push("thin_home_page");
    if (emptyPages) warnings.push("empty_page");
    if (!warnings.includes("scanner_v2_partial")) warnings.push("scanner_v2_partial");
    await input.store.putJob({
      ...job,
      state: "PARTIAL",
      updatedAt: new Date().toISOString(),
    });
  }
  const blocked = siteBlockedScan({
    fetched: manifest.fetched,
    warnings,
  });
  if (blocked) state = "BLOCKED";
  const reportedWarnings = blocked
    ? warningsWithSiteBlock(
        warnings.filter((warning) => warning !== "scanner_v2_partial" && warning !== "thin_home_page"),
      )
    : warnings;

  return {
    ok: true,
    untrusted: true,
    draft: draftFromFacts(facts),
    warnings: reportedWarnings,
    ...(blocked ? { outcome: "blocked_by_site" as const } : {}),
    sources: pages.map((page) => ({
      url: page.canonicalUrl,
      status: 200,
      bytes: Buffer.byteLength(page.visibleText, "utf8"),
    })),
    facts,
    factMeta: aggregated.factMeta,
    ...(knowledge.length ? { knowledge } : {}),
    scannerV2: {
      crawlId: input.crawlId,
      state,
      discovered: manifest.discovered,
      fetched: manifest.fetched,
      unresolved: manifest.unresolved,
      knowledgeChunks: knowledge.length,
      resumed: input.resumed,
    },
  };
}

export async function runPersistentScannerV2(
  rawUrl: string,
  options: ScannerV2RuntimeOptions = {},
): Promise<ScanResult> {
  const allowed = allowPublicHttpsUrl(rawUrl);
  if (!allowed.ok) {
    return {
      ok: false,
      error: allowed.reason,
      message: "Only public HTTPS business websites can be scanned.",
      warnings: [allowed.reason],
    };
  }

  const origin = new URL(allowed.url.origin);
  const releaseSha =
    options.releaseSha ??
    process.env.SCANNER_V2_RELEASE_SHA?.trim() ??
    "local";
  const stateRoot =
    options.stateRoot ??
    process.env.SCANNER_V2_STATE_ROOT?.trim() ??
    DEFAULT_SCANNER_V2_STATE_ROOT;
  const crawlId = crawlIdFor(origin.origin, releaseSha);
  const store = options.store ?? new FileScannerV2JobStore(stateRoot);
  const now = options.now ?? Date.now;
  const requestMs = boundedInt(
    options.requestMs,
    DEFAULT_SCANNER_V2_REQUEST_MS,
    1_000,
    MAX_SCANNER_V2_REQUEST_MS,
  );
  const started = now();
  const deadline = started + requestMs;
  const resultReserveMs = Math.min(SCANNER_V2_RESULT_RESERVE_MS, Math.floor(requestMs / 2));
  const workMs = Math.max(250, requestMs - resultReserveMs);
  const wallStarted = Date.now();
  const wallWorkDeadline = wallStarted + workMs;
  const wallResponseDeadline = wallStarted + requestMs;
  const remainingMs = () =>
    Math.min(Math.max(0, deadline - now()), Math.max(0, wallWorkDeadline - Date.now()));
  let resumed = false;
  let timerWon = false;

  const persistedPartial = async (): Promise<ScanResult> => {
    try {
      const result = await runtimeResult({
        store,
        crawlId,
        origin: origin.origin,
        resumed,
      });
      if (result.scannerV2?.state === "CRAWLING") {
        result.warnings = unique([...result.warnings, "time_budget"]);
      }
      return result;
    } catch {
      return {
        ok: true,
        untrusted: true,
        draft: {},
        warnings: ["time_budget"],
        sources: [],
        facts: {},
        factMeta: {},
        scannerV2: {
          crawlId,
          state: "CRAWLING",
          discovered: 0,
          fetched: 0,
          unresolved: 0,
          knowledgeChunks: 0,
          resumed,
        },
      };
    }
  };

  const budgetSnapshot = async (): Promise<ScanResult> => {
    let discovered = 0;
    let fetched = 0;
    let unresolved = 0;
    try {
      const urls = await store.listUrls(crawlId);
      discovered = urls.length;
      fetched = urls.filter((row) => row.status === "fetched").length;
      unresolved = urls.filter((row) => row.status === "unresolved").length;
    } catch {
      // The job may not exist yet. Counts stay at zero.
    }
    return {
      ok: true,
      untrusted: true,
      draft: {},
      warnings: ["time_budget"],
      sources: [],
      facts: {},
      factMeta: {},
      scannerV2: {
        crawlId,
        state: "CRAWLING",
        discovered,
        fetched,
        unresolved,
        knowledgeChunks: 0,
        resumed,
      },
    };
  };

  const finishWithin = (work: Promise<ScanResult>): Promise<ScanResult> => {
    const left = Math.max(0, wallResponseDeadline - Date.now());
    if (left <= 25) return budgetSnapshot();
    return new Promise((resolve) => {
      const backup = setTimeout(() => {
        void budgetSnapshot().then(resolve);
      }, left);
      work.then(
        (result) => {
          clearTimeout(backup);
          resolve(result);
        },
        () => {
          clearTimeout(backup);
          void budgetSnapshot().then(resolve);
        },
      );
    });
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const fetchAbort = new AbortController();
  const fetchAbortMs = Math.min(
    SCANNER_V2_FETCH_ABORT_MS,
    Math.max(250, requestMs - 1_000),
  );
  const fetchAbortTimer = setTimeout(() => fetchAbort.abort(), fetchAbortMs);
  const limited = new Promise<ScanResult>((resolve) => {
    timer = setTimeout(() => {
      timerWon = true;
      void finishWithin(persistedPartial()).then(resolve);
    }, workMs);
  });

  const execute = async (): Promise<ScanResult> => {
    const existing = await store.getJob(crawlId);
    resumed = Boolean(existing);
    let needsSeed = !existing;

    if (existing) {
      const priorUrls = await store.listUrls(crawlId);
      const hasFetchedEvidence = priorUrls.some(
        (row) => row.status === "fetched" || row.status === "duplicate",
      );
      const oversizedPageSkipped = priorUrls.some(
        (row) => row.status === "policy_skipped" && row.reason === "response_too_large",
      );
      const reset = (
        store as { resetZeroEvidenceRecords?: (id: string) => Promise<void> }
      ).resetZeroEvidenceRecords;
      if (!hasFetchedEvidence && !oversizedPageSkipped && typeof reset === "function") {
        await reset.call(store, crawlId);
        needsSeed = true;
      }
    }

    if (needsSeed) {
      const discoverBudget = Math.max(250, Math.min(2_500, requestMs));
      await seedJob({
        store,
        crawlId,
        origin,
        submittedUrl: allowed.url.toString(),
        releaseSha,
        discover: options.discover ?? discoverScannerV2Frontier,
        discoveryOptions: {
          ...options.discoveryOptions,
          deadlineAt: deadline,
          sitemapTimeoutMs: Math.min(
            options.discoveryOptions?.sitemapTimeoutMs ?? discoverBudget,
            discoverBudget,
          ),
          htmlTimeoutMs: Math.min(
            options.discoveryOptions?.htmlTimeoutMs ?? requestMs,
            requestMs,
          ),
          signal: fetchAbort.signal,
        },
      });
    }

    const processUrl =
      options.processUrl ??
      (await buildDefaultProcessor({
        store,
        crawlId,
        origin,
        lookup: options.discoveryOptions?.lookup,
        get: options.discoveryOptions?.get,
        browserDocumentFetch: options.discoveryOptions?.browserDocumentFetch,
        pageBudgetMs: remainingMs,
        signal: fetchAbort.signal,
      }));
    const batchSize = boundedInt(
      options.batchSize,
      DEFAULT_SCANNER_V2_BATCH_SIZE,
      1,
      64,
    );
    let probesConsidered = false;

    while (now() < deadline && Date.now() < wallWorkDeadline && !timerWon) {
      const batch = await runScannerV2WorkerBatch({
        store,
        crawlId,
        workerId: `runtime-${process.pid}`,
        processUrl,
        batchSize,
        deadlineAt: Math.min(deadline, wallWorkDeadline),
        nowMs: now,
        leaseMs: requestMs,
      });
      if (!probesConsidered) {
        const pages = await store.listPages(crawlId);
        if (pages.length > 0) {
          probesConsidered = true;
          const useful = pages.some((page) => pageHasUsefulFacts(page));
          if (!useful) {
            const added = await enqueueThinHomeProbes(store, crawlId, origin.origin);
            if (added > 0) continue;
          }
        }
      }
      if (!batch.hasMoreWork) break;
      if (batch.attempted === 0 && batch.deferred > 0) break;
    }

    return finishWithin(
      runtimeResult({
        store,
        crawlId,
        origin: origin.origin,
        resumed,
      }).then((result) => {
        if (result.scannerV2?.state === "CRAWLING" && (timerWon || now() >= deadline)) {
          result.warnings = unique([...result.warnings, "time_budget"]);
        }
        return result;
      }),
    );
  };

  const body = execute().catch((error: unknown) => {
    if (timerWon) return persistedPartial();
    throw error;
  });

  try {
    return await Promise.race([body, limited]);
  } finally {
    clearTimeout(fetchAbortTimer);
    if (timer) clearTimeout(timer);
  }
}
