import { extractDraftFromHtml } from "./extract.ts";
import { ssrfMessage } from "./fetch-safe.ts";
import { isWebIngestEnabled } from "./scan.ts";
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
import type {
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

  const consumePage = async (page: ScannerV2PageInput) => {
    const extracted = extractScannerV2Page(page);
    corpusChunks.push(...extracted.chunks);

    const bytes = Buffer.byteLength(page.html, "utf8");
    if (
      summaryPages.length < maxSummaryPages &&
      summaryBytes + bytes <= maxSummaryHtmlBytes
    ) {
      summaryPages.push({
        url: page.canonicalUrl ?? page.requestedUrl,
        html: page.html,
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
