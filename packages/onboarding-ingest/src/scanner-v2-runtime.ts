import {
  DEFAULT_MAX_REDIRECTS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import {
  MAX_READER_PAGES,
  READER_FALLBACK_MAX_BYTES,
  READER_FALLBACK_ORIGIN,
  READER_FALLBACK_TIMEOUT_MS,
  isReaderChallengePage,
  runScan,
} from "./scan.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import {
  DEFAULT_HTML_TIMEOUT_MS,
  DEFAULT_MAX_HTML_BYTES,
  discoverScannerV2Frontier,
  type ScannerV2DiscoveryResult,
} from "./scanner-v2-discovery.ts";
import {
  ingestScannerV2Document,
  isScannerV2SupportedDocumentUrl,
} from "./scanner-v2-documents.ts";
import { extractScannerV2Page } from "./scanner-v2-content.ts";
import {
  isScannerV2Enabled,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import {
  decideScannerV2RenderEscalation,
  renderScannerV2Page,
} from "./scanner-v2-renderer.ts";
import { projectScannerV2OperationalStatus } from "./scanner-v2-status.ts";
import {
  FileScannerV2JobStore,
  createScannerV2Job,
  runScannerV2WorkerBatch,
  type ScannerV2JobStore,
  type ScannerV2ProcessUrl,
} from "./scanner-v2-worker.ts";
import type {
  CrawlFetchMode,
  CrawlUrlDisposition,
  HttpGetFn,
  LookupFn,
  ScanKnowledgeChunk,
  ScanResult,
  ScanSuccess,
} from "./types.ts";

export const SCANNER_V2_STATE_DIR_ENV = "SCANNER_V2_STATE_DIR";
export const SCANNER_V2_RELEASE_SHA_ENV = "SCANNER_V2_RELEASE_SHA";
export const SCANNER_V2_MAX_HTML_PAGES = 250;
export const SCANNER_V2_MAX_DISCOVERED_URLS = 2_500;
export const SCANNER_V2_MAX_SITEMAP_DOCUMENTS = 32;
export const SCANNER_V2_RUNTIME_DEADLINE_MS = 270_000;
export const SCANNER_V2_MAX_BATCHES_PER_REQUEST = 64;
export const SCANNER_V2_KNOWLEDGE_MAX_CHUNKS = 200;
export const SCANNER_V2_KNOWLEDGE_MAX_CHARS = 300_000;

type DiscoveryFn = (
  url: string,
  options?: Parameters<typeof discoverScannerV2Frontier>[1],
) => Promise<ScannerV2DiscoveryResult>;

export type ScannerV2RuntimeOptions = {
  enabled?: boolean;
  v2Enabled?: boolean;
  stateDir?: string;
  releaseSha?: string;
  workerId?: string;
  deadlineMs?: number;
  maxBatches?: number;
  store?: ScannerV2JobStore;
  discovery?: DiscoveryFn;
  processUrl?: ScannerV2ProcessUrl;
  v1Scan?: (url: string) => Promise<ScanResult>;
  now?: () => Date;
};

function responseContentType(headers: Record<string, string>): string {
  return (
    Object.entries(headers).find(
      ([key]) => key.toLowerCase() === "content-type",
    )?.[1] ?? ""
  );
}

function isHtmlType(value: string): boolean {
  return /(?:text\/html|application\/xhtml\+xml)/i.test(value);
}

function isPlainTextType(value: string): boolean {
  return /^text\/plain\b/i.test(value);
}

function terminalDisposition(status: number): {
  disposition: "policy_skipped" | "unresolved";
  reason: string;
} {
  if ([401, 403, 404, 410].includes(status)) {
    return { disposition: "policy_skipped", reason: `http_${status}` };
  }
  return { disposition: "unresolved", reason: `http_${status}` };
}

function boundedInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(value as number)));
}

function crawlIdFor(origin: string, releaseSha: string): string {
  return "scanner-v2-" + stableContentHash(origin + "\u0000" + releaseSha).slice(0, 32);
}

function seedRows(rows: readonly CrawlUrlDisposition[]): CrawlUrlDisposition[] {
  return rows.map((row) => {
    const supportedDocument = isScannerV2SupportedDocumentUrl(row.url);
    const shouldProcess =
      row.status === "fetched" ||
      (supportedDocument &&
        row.status === "policy_skipped" &&
        row.reason === "content_type_not_stage2_html");
    if (!shouldProcess) return structuredClone(row);
    const seeded: CrawlUrlDisposition = {
      ...structuredClone(row),
      status: "queued",
      retryCount: 0,
    };
    delete seeded.reason;
    delete seeded.contentHash;
    delete seeded.fetchedAt;
    return seeded;
  });
}

function knowledgeFromChunks(
  chunks: Awaited<ReturnType<ScannerV2JobStore["listChunks"]>>,
): ScanKnowledgeChunk[] {
  const out: ScanKnowledgeChunk[] = [];
  let chars = 0;
  for (const chunk of chunks) {
    if (
      out.length >= SCANNER_V2_KNOWLEDGE_MAX_CHUNKS ||
      chars >= SCANNER_V2_KNOWLEDGE_MAX_CHARS
    ) break;
    const remaining = SCANNER_V2_KNOWLEDGE_MAX_CHARS - chars;
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

function makeDefaultProcessUrl(origin: string): ScannerV2ProcessUrl {
  const readerState = { used: 0 };

  return async ({ url }) => {
    if (isScannerV2SupportedDocumentUrl(url.url)) {
      const document = await ingestScannerV2Document(url.url, {
        origin,
        ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
      });
      if (!document.ok) {
        return {
          disposition: document.incomplete ? "unresolved" : "policy_skipped",
          reason: document.reason,
        };
      }
      return {
        disposition: document.complete ? "fetched" : "unresolved",
        ...(document.complete ? {} : { reason: "document_limit_reached" }),
        canonicalUrl: document.page.canonicalUrl,
        page: document.page,
        chunks: document.chunks,
      };
    }

    let response;
    let fetchMode: CrawlFetchMode = "http";
    try {
      response = await fetchPublicHttps(url.url, {
        timeoutMs: DEFAULT_HTML_TIMEOUT_MS,
        maxBytes: DEFAULT_MAX_HTML_BYTES,
        maxRedirects: DEFAULT_MAX_REDIRECTS,
      });
    } catch (error) {
      if (readerState.used >= MAX_READER_PAGES) throw error;
      const readerUrl = `${READER_FALLBACK_ORIGIN}/${url.url}`;
      let recovered = false;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const reader = await fetchPublicHttps(readerUrl, {
          timeoutMs: READER_FALLBACK_TIMEOUT_MS,
          maxBytes: READER_FALLBACK_MAX_BYTES,
          maxRedirects: 2,
          headers: {
            Accept: "text/html",
            "X-Respond-With": "html",
            "X-No-Cache": "true",
          },
        });
        if (reader.status >= 400 || !/<(?:html|head|body)\b/i.test(reader.body)) {
          break;
        }
        if (isReaderChallengePage(reader.body)) {
          if (attempt === 0) continue;
          break;
        }
        response = {
          ...reader,
          url: new URL(url.url),
          headers: {
            ...reader.headers,
            "content-type": "text/html; charset=utf-8",
          },
        };
        readerState.used += 1;
        fetchMode = "reader";
        recovered = true;
        break;
      }
      if (!recovered || !response) throw error;
    }

    if (response.url.origin !== origin) {
      return {
        disposition: "policy_skipped",
        reason: "cross_origin_redirect",
      };
    }
    if (response.status >= 400) return terminalDisposition(response.status);

    const contentType = responseContentType(response.headers);
    if (!isHtmlType(contentType) && !isPlainTextType(contentType)) {
      return {
        disposition: "policy_skipped",
        reason: "content_type_not_stage2_html",
      };
    }

    let body = response.body;
    let canonicalUrl = url.canonicalUrl ?? response.url.toString();
    if (isHtmlType(contentType) && fetchMode === "http") {
      const decision = decideScannerV2RenderEscalation({ rawHtml: body });
      if (decision.render) {
        const rendered = await renderScannerV2Page(url.url, { rawHtml: body });
        if (!rendered.ok) {
          return {
            disposition: "unresolved",
            reason: rendered.reason,
          };
        }
        body = rendered.html;
        canonicalUrl = rendered.finalUrl;
        fetchMode = "rendered";
      }
    }

    const canonicalPolicy = allowPublicHttpsUrl(canonicalUrl);
    if (!canonicalPolicy.ok || canonicalPolicy.url.origin !== origin) {
      return {
        disposition: "policy_skipped",
        reason: "canonical_url_rejected",
      };
    }

    const extracted = extractScannerV2Page({
      requestedUrl: url.url,
      canonicalUrl: canonicalPolicy.url.toString(),
      html: body,
      contentType: contentType || "text/html",
      fetchMode,
      ...(url.discoveredFrom ? { discoveredFrom: url.discoveredFrom } : {}),
      fetchedAt: new Date().toISOString(),
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

function successfulBase(
  rawUrl: string,
  result: ScanResult,
): ScanSuccess | null {
  if (result.ok) return result;
  const allowed = allowPublicHttpsUrl(rawUrl);
  if (!allowed.ok) return null;
  return {
    ok: true,
    untrusted: true,
    draft: {},
    warnings: [...result.warnings, result.error],
    sources: [],
    facts: { website: allowed.url.toString() },
  };
}

export async function runScannerV2Runtime(
  rawUrl: string,
  options: ScannerV2RuntimeOptions = {},
): Promise<ScanResult> {
  const enabled = options.enabled ?? true;
  const v2Enabled = options.v2Enabled ?? isScannerV2Enabled();
  if (!enabled || !v2Enabled) {
    return {
      ok: false,
      error: "scan_disabled",
      message: "Scanner V2 is disabled.",
      warnings: ["scan_disabled"],
    };
  }

  const allowed = allowPublicHttpsUrl(rawUrl);
  if (!allowed.ok) {
    return {
      ok: false,
      error: allowed.reason,
      message: "Only public HTTPS websites can be scanned.",
      warnings: [allowed.reason],
    };
  }

  const origin = allowed.url.origin;
  const releaseSha =
    options.releaseSha ??
    process.env[SCANNER_V2_RELEASE_SHA_ENV]?.trim() ??
    "dev";
  const crawlId = crawlIdFor(origin, releaseSha);
  const store =
    options.store ??
    new FileScannerV2JobStore(
      options.stateDir ??
        process.env[SCANNER_V2_STATE_DIR_ENV]?.trim() ??
        ".data/scanner-v2",
    );

  let job = await store.getJob(crawlId);
  if (!job) {
    const discovery = await (options.discovery ?? discoverScannerV2Frontier)(
      allowed.url.toString(),
      {
        maxHtmlPages: SCANNER_V2_MAX_HTML_PAGES,
        maxDiscoveredUrls: SCANNER_V2_MAX_DISCOVERED_URLS,
        maxSitemapDocuments: SCANNER_V2_MAX_SITEMAP_DOCUMENTS,
      },
    );
    job = await createScannerV2Job({
      store,
      crawlId,
      origin,
      releaseSha,
      urls: seedRows(discovery.manifest.urls),
      discoveryIncomplete: discovery.incomplete,
      discoveryWarnings: discovery.warnings,
    });
  }

  const started = Date.now();
  const deadlineMs = boundedInt(
    options.deadlineMs,
    SCANNER_V2_RUNTIME_DEADLINE_MS,
    1_000,
    SCANNER_V2_RUNTIME_DEADLINE_MS,
  );
  const maxBatches = boundedInt(
    options.maxBatches,
    SCANNER_V2_MAX_BATCHES_PER_REQUEST,
    1,
    SCANNER_V2_MAX_BATCHES_PER_REQUEST,
  );
  const processUrl = options.processUrl ?? makeDefaultProcessUrl(origin);
  const workerId =
    options.workerId ?? `scanner-v2-${process.pid}-${Date.now()}`;

  let batch = await runScannerV2WorkerBatch({
    store,
    crawlId,
    workerId,
    processUrl,
    now: options.now,
  });
  for (let count = 1; batch.hasMoreWork && count < maxBatches; count += 1) {
    if (Date.now() - started >= deadlineMs) break;
    batch = await runScannerV2WorkerBatch({
      store,
      crawlId,
      workerId,
      processUrl,
      now: options.now,
    });
  }

  job = (await store.getJob(crawlId)) ?? job;
  const chunks = await store.listChunks(crawlId);
  const knowledge = knowledgeFromChunks(chunks);
  const operational = projectScannerV2OperationalStatus({
    manifest: batch.manifest,
    job,
  });
  const v1 = await (options.v1Scan ?? ((url) => runScan(url, { enabled: true })))(
    rawUrl,
  );
  const base = successfulBase(rawUrl, v1);
  if (!base && knowledge.length === 0) return v1;
  const success = base ?? {
    ok: true as const,
    untrusted: true as const,
    draft: {},
    warnings: [],
    sources: [],
  };

  const warnings = [
    ...success.warnings,
    ...(job.discoveryWarnings ?? []),
    ...batch.manifest.urls
      .filter((row) => row.status === "unresolved")
      .map((row) => row.reason ?? "unresolved"),
    ...(batch.hasMoreWork ? ["scanner_v2_resume_pending"] : []),
  ];

  return {
    ...success,
    warnings: [...new Set(warnings)],
    ...(knowledge.length ? { knowledge } : {}),
    scannerV2: {
      state: operational.state,
      completeness: operational.completeness,
      discovered: operational.discovered,
      fetched: operational.fetched,
      queued: operational.queued,
      unresolved: operational.unresolved,
      skipped: operational.skipped,
      fullyLearned: operational.fullyLearned,
      ...(operational.lastScanAt
        ? { lastScanAt: operational.lastScanAt }
        : {}),
    },
  };
}
