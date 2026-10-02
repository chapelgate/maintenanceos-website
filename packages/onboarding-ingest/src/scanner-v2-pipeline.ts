import {
  DEFAULT_MAX_BYTES_PER_PAGE,
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import {
  buildCrawlManifest,
} from "./scanner-v2-foundation.ts";
import {
  discoverHtmlLinks,
  discoverScannerV2Frontier,
  type ScannerV2DiscoveryOptions,
  type ScannerV2DiscoveryResult,
} from "./scanner-v2-discovery.ts";
import {
  extractScannerV2Page,
} from "./scanner-v2-content.ts";
import {
  extractScannerV2CanonicalLink,
} from "./scanner-v2-url-policy.ts";
import {
  decideScannerV2RenderEscalation,
  renderResultToPageInput,
  renderScannerV2Page,
  type ScannerV2BrowserBackend,
} from "./scanner-v2-renderer.ts";
import {
  ingestScannerV2Document,
  isScannerV2SupportedDocumentUrl,
  isScannerV2UnsupportedTextDocumentUrl,
  type ScannerV2DocumentOptions,
} from "./scanner-v2-documents.ts";
import {
  createScannerV2Job,
  runScannerV2WorkerBatch,
  type ScannerV2JobStore,
  type ScannerV2ProcessUrl,
} from "./scanner-v2-worker.ts";
import {
  InMemoryBm25CorpusIndex,
  type CorpusIndex,
  type CorpusIndexStats,
} from "./scanner-v2-retrieval.ts";
import {
  answerGroundedReceptionistQuestion,
  type GroundedReceptionistAnswer,
  type ReceptionistGroundingFacts,
} from "./scanner-v2-grounding.ts";
import {
  isReaderChallengePage,
  READER_FALLBACK_MAX_BYTES,
  READER_FALLBACK_ORIGIN,
  READER_FALLBACK_TIMEOUT_MS,
} from "./scan.ts";
import type {
  BinaryHttpGetFn,
  CrawlManifest,
  CrawlPage,
  CrawlUrlDisposition,
  HttpGetFn,
  LookupFn,
  ScanError,
} from "./types.ts";

export const DEFAULT_STAGE12_MAX_BATCHES = 10_000;
export const DEFAULT_STAGE12_BATCH_SIZE = 8;

export type ScannerV2InitialProcessorOptions = {
  origin: string;
  lookup?: LookupFn;
  get?: HttpGetFn;
  readerLookup?: LookupFn;
  readerGet?: HttpGetFn;
  readerFallback?: boolean;
  documentGet?: BinaryHttpGetFn;
  renderBackend?: ScannerV2BrowserBackend;
  renderTimeoutMs?: number;
  maxPathDepth?: number;
  document?: Omit<
    ScannerV2DocumentOptions,
    "origin" | "discoveredFrom" | "lookup" | "get"
  >;
};

export type ScannerV2PipelineOptions = {
  store: ScannerV2JobStore;
  origin: string;
  releaseSha: string;
  crawlId: string;
  workerId?: string;
  batchSize?: number;
  maxBatches?: number;
  discovery?: ScannerV2DiscoveryOptions;
  processor?: Omit<ScannerV2InitialProcessorOptions, "origin">;
  index?: CorpusIndex;
};

export type ScannerV2PipelineResult = {
  crawlId: string;
  releaseSha: string;
  manifest: CrawlManifest;
  discovery: ScannerV2DiscoveryResult;
  pageCount: number;
  chunkCount: number;
  indexStats: CorpusIndexStats;
  warnings: string[];
  answer(question: string): Promise<GroundedReceptionistAnswer>;
};

function headerValue(
  headers: Record<string, string>,
  name: string,
): string {
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1]?.trim() ?? "";
}

function isHtml(contentType: string): boolean {
  return /(?:text\/html|application\/xhtml\+xml)/i.test(contentType);
}

function isPlainText(contentType: string): boolean {
  return /^text\/plain\b/i.test(contentType);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function fetchViaReader(
  targetUrl: string,
  options: ScannerV2InitialProcessorOptions,
): Promise<{ html: string; warnings: string[] } | null> {
  if (options.readerFallback === false) return null;

  const readerUrl = `${READER_FALLBACK_ORIGIN}/${targetUrl}`;
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetchPublicHttps(readerUrl, {
        lookup: options.readerLookup,
        get: options.readerGet,
        timeoutMs: READER_FALLBACK_TIMEOUT_MS,
        maxBytes: READER_FALLBACK_MAX_BYTES,
        maxRedirects: 2,
        headers: {
          Accept: "text/html",
          "X-Respond-With": "html",
          "X-No-Cache": "true",
        },
      });
      if (response.status >= 400) return null;
      if (!/<(?:html|head|body)\b/i.test(response.body)) return null;
      if (isReaderChallengePage(response.body)) {
        if (attempt === 0) continue;
        return null;
      }
      return {
        html: response.body,
        warnings: ["reader_fallback_used"],
      };
    }
  } catch {
    return null;
  }
  return null;
}

function seededRows(
  manifest: CrawlManifest,
): CrawlUrlDisposition[] {
  return manifest.urls.map((row) => {
    if (
      isScannerV2SupportedDocumentUrl(row.url) ||
      isScannerV2UnsupportedTextDocumentUrl(row.url)
    ) {
      return {
        ...row,
        status: "queued",
        reason: undefined,
        retryCount: 0,
        lastAttemptAt: undefined,
      };
    }
    if (row.status === "fetched" || row.status === "unresolved") {
      return {
        ...row,
        status: "queued",
        reason: undefined,
        retryCount: 0,
        lastAttemptAt: undefined,
      };
    }
    return structuredClone(row);
  });
}

function mergeFacts(pages: readonly CrawlPage[]): ReceptionistGroundingFacts {
  const result: ReceptionistGroundingFacts = {};
  const serviceValues = new Set<string>();
  const locationValues = new Set<string>();
  const phoneValues = new Set<string>();
  const emailValues = new Set<string>();
  const faqs: NonNullable<ReceptionistGroundingFacts["faqs"]> = [];
  const serviceSources = new Set<string>();
  const locationSources = new Set<string>();
  const phoneSources = new Set<string>();
  const emailSources = new Set<string>();

  for (const page of pages) {
    const facts = page.structuredFacts as {
      businessName?: unknown;
      hours?: unknown;
      services?: unknown;
      locations?: unknown;
      contact?: unknown;
      faqs?: unknown;
    };

    if (!result.businessName && typeof facts.businessName === "string" && facts.businessName.trim()) {
      result.businessName = {
        value: facts.businessName.trim(),
        sourceUrls: [page.canonicalUrl],
      };
    }
    if (!result.hours && typeof facts.hours === "string" && facts.hours.trim()) {
      result.hours = {
        value: facts.hours.trim(),
        sourceUrls: [page.canonicalUrl],
      };
    }
    if (Array.isArray(facts.services)) {
      for (const value of facts.services) {
        if (typeof value === "string" && value.trim()) serviceValues.add(value.trim());
      }
      if (facts.services.length) serviceSources.add(page.canonicalUrl);
    }
    if (Array.isArray(facts.locations)) {
      for (const value of facts.locations) {
        if (typeof value === "string" && value.trim()) locationValues.add(value.trim());
      }
      if (facts.locations.length) locationSources.add(page.canonicalUrl);
    }
    if (facts.contact && typeof facts.contact === "object" && !Array.isArray(facts.contact)) {
      const contact = facts.contact as { phones?: unknown; emails?: unknown };
      if (Array.isArray(contact.phones)) {
        for (const value of contact.phones) {
          if (typeof value === "string" && value.trim()) phoneValues.add(value.trim());
        }
        if (contact.phones.length) phoneSources.add(page.canonicalUrl);
      }
      if (Array.isArray(contact.emails)) {
        for (const value of contact.emails) {
          if (typeof value === "string" && value.trim()) emailValues.add(value.trim());
        }
        if (contact.emails.length) emailSources.add(page.canonicalUrl);
      }
    }
    if (Array.isArray(facts.faqs)) {
      for (const item of facts.faqs) {
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const faq = item as { question?: unknown; answer?: unknown };
        if (
          typeof faq.question === "string" &&
          faq.question.trim() &&
          typeof faq.answer === "string" &&
          faq.answer.trim()
        ) {
          faqs.push({
            question: faq.question.trim(),
            answer: faq.answer.trim(),
            sourceUrls: [page.canonicalUrl],
          });
        }
      }
    }
  }

  if (serviceValues.size) {
    result.services = {
      value: [...serviceValues],
      sourceUrls: [...serviceSources],
    };
  }
  if (locationValues.size) {
    result.locations = {
      value: [...locationValues],
      sourceUrls: [...locationSources],
    };
  }
  if (phoneValues.size) {
    result.phones = {
      value: [...phoneValues],
      sourceUrls: [...phoneSources],
    };
  }
  if (emailValues.size) {
    result.emails = {
      value: [...emailValues],
      sourceUrls: [...emailSources],
    };
  }
  if (faqs.length) result.faqs = faqs;
  return result;
}

export function createScannerV2InitialProcessor(
  options: ScannerV2InitialProcessorOptions,
): ScannerV2ProcessUrl {
  const origin = new URL(options.origin).origin;

  return async ({ url }) => {
    if (isScannerV2UnsupportedTextDocumentUrl(url.url)) {
      return {
        disposition: "unresolved",
        reason: "unsupported_document",
      };
    }

    if (isScannerV2SupportedDocumentUrl(url.url)) {
      const document = await ingestScannerV2Document(url.url, {
        origin,
        lookup: options.lookup,
        ...(options.documentGet ? { get: options.documentGet } : {}),
        ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
        ...(options.document ?? {}),
      });
      if (!document.ok) {
        return {
          disposition: document.incomplete ? "unresolved" : "policy_skipped",
          reason: document.reason,
        };
      }
      if (!document.complete) {
        return {
          disposition: "unresolved",
          reason: "document_limit_reached",
          canonicalUrl: document.page.canonicalUrl,
          page: document.page,
          chunks: document.chunks,
        };
      }
      return {
        disposition: "fetched",
        canonicalUrl: document.page.canonicalUrl,
        page: document.page,
        chunks: document.chunks,
      };
    }

    let raw;
    let readerWarnings: string[] = [];
    try {
      raw = await fetchPublicHttps(url.url, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: DEFAULT_PAGE_TIMEOUT_MS,
        maxBytes: DEFAULT_MAX_BYTES_PER_PAGE,
        maxRedirects: DEFAULT_MAX_REDIRECTS,
        allowedOrigin: origin,
      });
    } catch (error) {
      if (
        error instanceof ScanError &&
        [
          "http_not_allowed",
          "unsupported_scheme",
          "userinfo_not_allowed",
          "non_public_host",
          "non_public_resolved_ip",
          "cross_origin_redirect",
          "invalid_url",
        ].includes(error.code)
      ) {
        return {
          disposition: "policy_skipped",
          reason: error.code,
        };
      }
      const reader = await fetchViaReader(url.url, options);
      if (!reader) {
        return {
          disposition: "unresolved",
          reason: error instanceof ScanError ? error.code : "fetch_failed",
        };
      }
      readerWarnings = reader.warnings;
      const canonical = extractScannerV2CanonicalLink({
        html: reader.html,
        pageUrl: url.url,
        origin,
        maxPathDepth: options.maxPathDepth,
      });
      const canonicalUrl = canonical?.ok ? canonical.url : url.url;
      const extracted = extractScannerV2Page({
        requestedUrl: url.url,
        canonicalUrl,
        html: reader.html,
        contentType: "text/html",
        fetchMode: "reader",
        ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
      });
      return {
        disposition: "fetched",
        reason: readerWarnings.join(","),
        canonicalUrl: extracted.page.canonicalUrl,
        page: extracted.page,
        chunks: extracted.chunks,
        discoveredUrls: discoverHtmlLinks({
          html: reader.html,
          pageUrl: url.url,
          origin,
          maxPathDepth: options.maxPathDepth,
        }),
      };
    }

    if (raw.status === 404 || raw.status === 410) {
      return {
        disposition: "policy_skipped",
        reason: `http_${raw.status}`,
        canonicalUrl: raw.url.toString(),
      };
    }

    if (raw.status === 401 || raw.status === 403) {
      const reader = await fetchViaReader(url.url, options);
      if (reader) {
        const extracted = extractScannerV2Page({
          requestedUrl: url.url,
          canonicalUrl: url.url,
          html: reader.html,
          contentType: "text/html",
          fetchMode: "reader",
          ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
        });
        return {
          disposition: "fetched",
          reason: "reader_fallback_used",
          canonicalUrl: extracted.page.canonicalUrl,
          page: extracted.page,
          chunks: extracted.chunks,
          discoveredUrls: discoverHtmlLinks({
            html: reader.html,
            pageUrl: url.url,
            origin,
            maxPathDepth: options.maxPathDepth,
          }),
        };
      }
    }

    if (raw.status >= 400) {
      return {
        disposition: "unresolved",
        reason: `http_${raw.status}`,
        canonicalUrl: raw.url.toString(),
      };
    }

    const contentType = headerValue(raw.headers, "content-type");
    if (!isHtml(contentType) && !isPlainText(contentType)) {
      return {
        disposition: "policy_skipped",
        reason: "content_type_not_text",
        canonicalUrl: raw.url.toString(),
      };
    }

    const html = isHtml(contentType)
      ? raw.body
      : `<html><body><pre>${escapeHtml(raw.body)}</pre></body></html>`;

    const canonical = extractScannerV2CanonicalLink({
      html,
      pageUrl: raw.url.toString(),
      origin,
      maxPathDepth: options.maxPathDepth,
    });
    const canonicalUrl = canonical?.ok
      ? canonical.url
      : raw.url.toString();

    let extracted = extractScannerV2Page({
      requestedUrl: url.url,
      canonicalUrl,
      html,
      contentType: contentType || "text/html",
      fetchMode: "http",
      ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
      headers: raw.headers,
    });

    let discoveredUrls = isHtml(contentType)
      ? discoverHtmlLinks({
          html,
          pageUrl: raw.url.toString(),
          origin,
          maxPathDepth: options.maxPathDepth,
        })
      : [];

    if (
      isHtml(contentType) &&
      decideScannerV2RenderEscalation({
        rawHtml: html,
        extractedVisibleTextChars: extracted.page.visibleText.length,
      }).render
    ) {
      const rendered = await renderScannerV2Page(url.url, {
        rawHtml: html,
        extractedVisibleTextChars: extracted.page.visibleText.length,
        lookup: options.lookup,
        get: options.get,
        ...(options.renderBackend ? { backend: options.renderBackend } : {}),
        ...(options.renderTimeoutMs !== undefined
          ? { timeoutMs: options.renderTimeoutMs }
          : {}),
        ...(options.maxPathDepth !== undefined
          ? { maxPathDepth: options.maxPathDepth }
          : {}),
      });
      if (!rendered.ok) {
        if (rendered.incomplete) {
          return {
            disposition: "unresolved",
            reason: rendered.reason,
            canonicalUrl,
          };
        }
      } else {
        extracted = extractScannerV2Page(
          renderResultToPageInput({
            requestedUrl: url.url,
            result: rendered,
            ...(url.discoveredFrom
              ? { discoveredFrom: url.discoveredFrom }
              : {}),
          }),
        );
        discoveredUrls = rendered.links;
      }
    }

    return {
      disposition: "fetched",
      canonicalUrl: extracted.page.canonicalUrl,
      page: extracted.page,
      chunks: extracted.chunks,
      discoveredUrls,
    };
  };
}

export async function runScannerV2Pipeline(
  options: ScannerV2PipelineOptions,
): Promise<ScannerV2PipelineResult> {
  const origin = new URL(options.origin).origin;
  const discovery = await discoverScannerV2Frontier(origin, {
    ...(options.discovery ?? {}),
  });

  const seed = seededRows(discovery.manifest);
  await createScannerV2Job({
    store: options.store,
    crawlId: options.crawlId,
    origin,
    releaseSha: options.releaseSha,
    urls: seed,
  });

  const processor = createScannerV2InitialProcessor({
    origin,
    ...(options.discovery?.lookup && !options.processor?.lookup
      ? { lookup: options.discovery.lookup }
      : {}),
    ...(options.discovery?.get && !options.processor?.get
      ? { get: options.discovery.get }
      : {}),
    ...(options.processor ?? {}),
  });

  const requestedBatchSize = options.batchSize;
  const batchSize = Number.isFinite(requestedBatchSize)
    ? Math.max(1, Math.min(64, Math.trunc(requestedBatchSize as number)))
    : DEFAULT_STAGE12_BATCH_SIZE;
  const requestedMaxBatches = options.maxBatches;
  const maxBatches = Number.isFinite(requestedMaxBatches)
    ? Math.max(
        1,
        Math.min(
          DEFAULT_STAGE12_MAX_BATCHES,
          Math.trunc(requestedMaxBatches as number),
        ),
      )
    : DEFAULT_STAGE12_MAX_BATCHES;

  let manifest = buildCrawlManifest({
    crawlId: options.crawlId,
    origin,
    requestedState: "CRAWLING",
    urls: seed,
  });
  let batches = 0;

  while (batches < maxBatches) {
    batches += 1;
    const result = await runScannerV2WorkerBatch({
      store: options.store,
      crawlId: options.crawlId,
      workerId: options.workerId ?? "scanner-v2-stage12",
      processUrl: processor,
      batchSize,
    });
    manifest = result.manifest;
    if (!result.hasMoreWork) break;
  }

  if (manifest.queued > 0) {
    const job = await options.store.getJob(options.crawlId);
    if (job) {
      await options.store.putJob({
        ...job,
        state: "PARTIAL",
        updatedAt: new Date().toISOString(),
      });
    }
    manifest = buildCrawlManifest({
      crawlId: options.crawlId,
      origin,
      requestedState: "PARTIAL",
      urls: await options.store.listUrls(options.crawlId),
    });
  }

  if (discovery.incomplete && manifest.state === "COMPLETE") {
    const job = await options.store.getJob(options.crawlId);
    if (job) {
      await options.store.putJob({
        ...job,
        state: "PARTIAL",
        updatedAt: new Date().toISOString(),
      });
    }
    manifest = buildCrawlManifest({
      crawlId: options.crawlId,
      origin,
      requestedState: "PARTIAL",
      urls: await options.store.listUrls(options.crawlId),
    });
  }

  const pages = await options.store.listPages(options.crawlId);
  const chunks = await options.store.listChunks(options.crawlId);
  const index = options.index ?? new InMemoryBm25CorpusIndex();
  await index.index(options.crawlId, chunks);
  const indexStats = await index.stats(options.crawlId);
  const facts = mergeFacts(pages);

  return {
    crawlId: options.crawlId,
    releaseSha: options.releaseSha,
    manifest,
    discovery,
    pageCount: pages.length,
    chunkCount: chunks.length,
    indexStats,
    warnings: [...new Set(discovery.warnings)],
    answer: async (question: string) =>
      answerGroundedReceptionistQuestion(question, {
        crawlId: options.crawlId,
        index,
        facts,
      }),
  };
}
