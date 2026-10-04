import { extractDraftFromHtml } from "./extract.ts";
import { fetchPublicHttps, ssrfMessage } from "./fetch-safe.ts";
import {
  isReaderChallengePage,
  isWebIngestEnabled,
  READER_FALLBACK_MAX_BYTES,
  READER_FALLBACK_ORIGIN,
  READER_FALLBACK_TIMEOUT_MS,
} from "./scan.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import {
  extractScannerV2Page,
  type ScannerV2PageInput,
} from "./scanner-v2-content.ts";
import {
  discoverScannerV2Frontier,
  type ScannerV2DiscoveryOptions,
} from "./scanner-v2-discovery.ts";
import {
  ingestScannerV2ManifestDocuments,
  type ScannerV2DocumentBatchOptions,
} from "./scanner-v2-documents.ts";
import { isScannerV2Enabled } from "./scanner-v2-foundation.ts";
import { decideScannerV2RenderEscalation } from "./scanner-v2-renderer.ts";
import type {
  HttpGetFn,
  LookupFn,
  ScanKnowledgeChunk,
  ScanResult,
  ScannerV2ScanSummary,
} from "./types.ts";

export const V2_LIVE_MAX_HTML_PAGES = 250;
export const V2_LIVE_MAX_DISCOVERED_URLS = 2_500;
export const V2_LIVE_MAX_SITEMAP_DOCUMENTS = 32;
export const V2_SUMMARY_MAX_PAGES = 128;
export const V2_SUMMARY_MAX_HTML_BYTES = 32 * 1024 * 1024;
export const V2_RESPONSE_MAX_KNOWLEDGE_CHARS = 450_000;
export const V2_RESPONSE_MAX_KNOWLEDGE_CHUNKS = 300;

export type RunScannerV2ScanOptions = Omit<
  ScannerV2DiscoveryOptions,
  "onHtmlPage"
> & {
  enabled?: boolean;
  scannerV2Enabled?: boolean;
  documentOptions?: ScannerV2DocumentBatchOptions;
  maxSummaryPages?: number;
  maxSummaryHtmlBytes?: number;
  maxKnowledgeChars?: number;
  maxKnowledgeChunks?: number;
  /** Reuse the existing public reader only when raw HTML is a thin/app shell. */
  readerFallback?: boolean;
  readerLookup?: LookupFn;
  readerGet?: HttpGetFn;
};

function boundedInt(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(value as number)));
}

function boundedKnowledge(
  chunks: readonly {
    id: string;
    canonicalUrl: string;
    title?: string;
    headingPath: string[];
    text: string;
    contentHash: string;
  }[],
  maxChars: number,
  maxChunks: number,
): ScanKnowledgeChunk[] {
  const out: ScanKnowledgeChunk[] = [];
  const seen = new Set<string>();
  let chars = 0;

  for (const chunk of chunks) {
    if (out.length >= maxChunks || chars >= maxChars) break;
    if (seen.has(chunk.id)) continue;
    const remaining = maxChars - chars;
    if (remaining < 80) break;
    const text = chunk.text.trim().slice(0, remaining);
    if (!text) continue;
    seen.add(chunk.id);
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

async function recoverReaderPage(
  page: ScannerV2PageInput,
  options: Pick<
    RunScannerV2ScanOptions,
    "readerLookup" | "readerGet"
  >,
): Promise<ScannerV2PageInput> {
  const readerUrl = `${READER_FALLBACK_ORIGIN}/${page.requestedUrl}`;
  let lastReason = "reader_fetch_failed";

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
    if (response.status >= 400) {
      lastReason = `reader_http_${response.status}`;
      break;
    }
    if (!/<(?:html|head|body)\b/i.test(response.body)) {
      lastReason = "reader_non_html";
      break;
    }
    if (isReaderChallengePage(response.body)) {
      lastReason = "reader_challenge_rejected";
      if (attempt === 0) continue;
      break;
    }
    return {
      ...page,
      html: response.body,
      fetchMode: "reader",
    };
  }

  throw new Error(lastReason);
}

export async function runScannerV2Scan(
  rawUrl: string,
  options: RunScannerV2ScanOptions = {},
): Promise<ScanResult> {
  const enabled = options.enabled ?? isWebIngestEnabled();
  const v2Enabled = options.scannerV2Enabled ?? isScannerV2Enabled();
  if (!enabled || !v2Enabled) {
    return {
      ok: false,
      error: "scan_disabled",
      message: "Scanner V2 is disabled. The Scanner V1 rollback path remains available.",
      warnings: ["scan_disabled"],
    };
  }

  const allow = allowPublicHttpsUrl(rawUrl);
  if (!allow.ok) {
    return {
      ok: false,
      error: allow.reason,
      message: ssrfMessage(allow.reason),
      warnings: ["ssrf_denied"],
    };
  }

  const maxSummaryPages = boundedInt(
    options.maxSummaryPages,
    V2_SUMMARY_MAX_PAGES,
    1,
    V2_SUMMARY_MAX_PAGES,
  );
  const maxSummaryHtmlBytes = boundedInt(
    options.maxSummaryHtmlBytes,
    V2_SUMMARY_MAX_HTML_BYTES,
    1024,
    V2_SUMMARY_MAX_HTML_BYTES,
  );
  const maxKnowledgeChars = boundedInt(
    options.maxKnowledgeChars,
    V2_RESPONSE_MAX_KNOWLEDGE_CHARS,
    1024,
    V2_RESPONSE_MAX_KNOWLEDGE_CHARS,
  );
  const maxKnowledgeChunks = boundedInt(
    options.maxKnowledgeChunks,
    V2_RESPONSE_MAX_KNOWLEDGE_CHUNKS,
    1,
    V2_RESPONSE_MAX_KNOWLEDGE_CHUNKS,
  );

  const summaryPages: Array<{ url: string; html: string }> = [];
  const corpusChunks: ReturnType<typeof extractScannerV2Page>["chunks"] = [];
  let summaryBytes = 0;
  let summaryTruncated = false;
  const adapterWarnings: string[] = [];
  const readerFallbackEnabled =
    options.readerFallback ?? (!options.lookup && !options.get);

  const consumePage = async (page: ScannerV2PageInput) => {
    let sourcePage = page;
    const renderDecision = decideScannerV2RenderEscalation({
      rawHtml: page.html,
    });
    if (renderDecision.render) {
      if (!readerFallbackEnabled) {
        adapterWarnings.push("scanner_v2_render_required");
        throw new Error("scanner_v2_render_required");
      }
      try {
        sourcePage = await recoverReaderPage(page, options);
        adapterWarnings.push("reader_fallback_used");
      } catch (error) {
        adapterWarnings.push(
          error instanceof Error && error.message
            ? error.message
            : "reader_fetch_failed",
        );
        throw error;
      }
    }

    const extracted = extractScannerV2Page(sourcePage);
    corpusChunks.push(...extracted.chunks);

    const bytes = Buffer.byteLength(sourcePage.html, "utf8");
    if (
      summaryPages.length < maxSummaryPages &&
      summaryBytes + bytes <= maxSummaryHtmlBytes
    ) {
      summaryPages.push({
        url: sourcePage.canonicalUrl ?? sourcePage.requestedUrl,
        html: sourcePage.html,
      });
      summaryBytes += bytes;
    } else {
      summaryTruncated = true;
    }
  };

  const discovery = await discoverScannerV2Frontier(allow.url.toString(), {
    ...options,
    maxHtmlPages: Math.min(
      options.maxHtmlPages ?? V2_LIVE_MAX_HTML_PAGES,
      V2_LIVE_MAX_HTML_PAGES,
    ),
    maxDiscoveredUrls: Math.min(
      options.maxDiscoveredUrls ?? V2_LIVE_MAX_DISCOVERED_URLS,
      V2_LIVE_MAX_DISCOVERED_URLS,
    ),
    maxSitemapDocuments: Math.min(
      options.maxSitemapDocuments ?? V2_LIVE_MAX_SITEMAP_DOCUMENTS,
      V2_LIVE_MAX_SITEMAP_DOCUMENTS,
    ),
    onHtmlPage: consumePage,
  });

  const documents = await ingestScannerV2ManifestDocuments(
    discovery.manifest,
    options.documentOptions ?? {},
  );
  corpusChunks.push(...documents.chunks);

  const extracted = extractDraftFromHtml(summaryPages);
  const warnings = [
    ...adapterWarnings,
    ...discovery.warnings,
    ...documents.warnings,
    ...extracted.warnings,
  ];
  const partial = discovery.incomplete || documents.incomplete;
  if (partial) warnings.push("scanner_v2_partial");
  if (summaryTruncated) warnings.push("scanner_v2_summary_truncated");

  const knowledge = boundedKnowledge(
    corpusChunks,
    maxKnowledgeChars,
    maxKnowledgeChunks,
  );
  if (knowledge.length < corpusChunks.length) {
    warnings.push("scanner_v2_response_knowledge_truncated");
  }

  const facts = {
    ...extracted.facts,
    website: extracted.facts.website ?? allow.url.toString(),
  };
  const factMeta = {
    ...extracted.factMeta,
    website:
      extracted.factMeta.website ??
      ({ confidence: "high", source: "fetched_url" } as const),
  };

  const scannerV2: ScannerV2ScanSummary = {
    state: partial ? "PARTIAL" : "COMPLETE",
    discovered: documents.manifest.discovered,
    fetched: documents.manifest.fetched,
    unresolved: documents.manifest.unresolved,
    knowledgeChunks: knowledge.length,
  };

  if (
    summaryPages.length === 0 &&
    knowledge.length === 0 &&
    Object.keys(extracted.draft).length === 0
  ) {
    return {
      ok: false,
      error: "fetch_failed",
      message: "No usable public website content could be indexed. No crawl results were invented.",
      warnings: [...new Set(warnings.length ? warnings : ["no_pages_fetched"])],
    };
  }

  return {
    ok: true,
    untrusted: true,
    draft: extracted.draft,
    warnings: [...new Set(warnings)],
    sources: [
      ...discovery.pageSources,
      ...documents.sources.map((source) => ({
        url: source.url,
        status: source.status,
        bytes: source.bytes,
      })),
    ],
    ...(Object.keys(facts).length ? { facts } : {}),
    ...(Object.keys(factMeta).length ? { factMeta } : {}),
    ...(Object.keys(extracted.fieldMeta).length
      ? { fieldMeta: extracted.fieldMeta }
      : {}),
    ...(knowledge.length ? { knowledge } : {}),
    scannerV2,
  };
}
