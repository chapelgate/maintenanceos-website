import { resolve } from "node:path";
import { extractScannerV2Page } from "./scanner-v2-content.ts";
import {
  discoverScannerV2Frontier,
  type ScannerV2DiscoveryOptions,
} from "./scanner-v2-discovery.ts";
import { ingestScannerV2ManifestDocuments } from "./scanner-v2-documents.ts";
import {
  buildCrawlManifest,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import {
  createScannerV2Job,
  FileScannerV2JobStore,
} from "./scanner-v2-worker.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import type {
  BusinessFacts,
  CrawlJob,
  CrawlManifest,
  CrawlPage,
  CrawlState,
  PartialDraft,
  ScanKnowledgeChunk,
  ScanResult,
  ScannerV2ScanSummary,
} from "./types.ts";

export const DEFAULT_SCANNER_V2_STATE_ROOT = ".data/scanner-v2";
export const DEFAULT_SCANNER_V2_BATCH_PAGES = 16;
export const MAX_SCANNER_V2_BATCH_PAGES = 64;
export const DEFAULT_SCANNER_V2_MAX_BATCHES = 8;
export const MAX_SCANNER_V2_MAX_BATCHES = 32;
export const DEFAULT_SCANNER_V2_TIME_BUDGET_MS = 90_000;
export const MAX_SCANNER_V2_TIME_BUDGET_MS = 240_000;
export const DEFAULT_SCANNER_V2_MAX_DISCOVERED_URLS = 2_500;
export const MAX_SCANNER_V2_RESPONSE_KNOWLEDGE_CHARS = 300_000;
export const MAX_SCANNER_V2_RESPONSE_KNOWLEDGE_CHUNKS = 200;

export type ScannerV2RuntimeOptions = {
  stateRoot?: string;
  releaseSha?: string;
  batchPages?: number;
  maxBatches?: number;
  timeBudgetMs?: number;
  maxDiscoveredUrls?: number;
  discovery?: Omit<
    ScannerV2DiscoveryOptions,
    "resumeManifest" | "onHtmlPage" | "maxHtmlPages" | "maxDiscoveredUrls"
  >;
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

function stringValue(value: unknown, max = 4_000): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text ? text.slice(0, max) : undefined;
}

function stringArray(
  value: unknown,
  maxItems: number,
  maxChars: number,
): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((item) => stringValue(item, maxChars))
        .filter((item): item is string => Boolean(item)),
    ),
  ].slice(0, maxItems);
}

function mergeFacts(
  pages: readonly CrawlPage[],
  website: string,
): BusinessFacts {
  let businessName: string | undefined;
  let hours: string | undefined;
  const services = new Set<string>();
  const locations = new Set<string>();
  const phones = new Set<string>();
  const emails = new Set<string>();
  const faqMap = new Map<string, { question: string; answer: string }>();

  for (const page of pages) {
    const facts = page.structuredFacts as Record<string, unknown>;
    businessName ||= stringValue(facts.businessName, 200);
    hours ||= stringValue(facts.hours, 2_000);

    for (const item of stringArray(facts.services, 100, 300)) {
      services.add(item);
    }
    for (const item of stringArray(facts.locations, 32, 500)) {
      locations.add(item);
    }

    if (
      facts.contact &&
      typeof facts.contact === "object" &&
      !Array.isArray(facts.contact)
    ) {
      const contact = facts.contact as Record<string, unknown>;
      for (const item of stringArray(contact.phones, 16, 80)) phones.add(item);
      for (const item of stringArray(contact.emails, 16, 120)) emails.add(item);
    }

    if (Array.isArray(facts.faqs)) {
      for (const item of facts.faqs.slice(0, 100)) {
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const rec = item as Record<string, unknown>;
        const question = stringValue(rec.question, 500);
        const answer = stringValue(rec.answer, 2_000);
        if (!question || !answer) continue;
        faqMap.set(question + "\u0000" + answer, { question, answer });
      }
    }
  }

  return {
    website,
    ...(businessName ? { businessName } : {}),
    ...(locations.size ? { locations: [...locations].slice(0, 32) } : {}),
    ...(phones.size || emails.size
      ? {
          contact: {
            ...(phones.size ? { phones: [...phones].slice(0, 16) } : {}),
            ...(emails.size ? { emails: [...emails].slice(0, 16) } : {}),
          },
        }
      : {}),
    ...(services.size ? { services: [...services].slice(0, 100) } : {}),
    ...(hours ? { hours } : {}),
    ...(faqMap.size ? { faqs: [...faqMap.values()].slice(0, 100) } : {}),
  };
}

function draftFromFacts(facts: BusinessFacts): PartialDraft {
  const draft: PartialDraft = {};
  if (facts.businessName) draft.businessName = facts.businessName;
  if (facts.hours) draft.hours = facts.hours;
  if (facts.services?.length) draft.services = facts.services.join("\n");
  if (facts.faqs?.length) {
    draft.faqs = facts.faqs
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");
  }
  return draft;
}

function boundedKnowledge(
  chunks: Awaited<ReturnType<FileScannerV2JobStore["listChunks"]>>,
): ScanKnowledgeChunk[] {
  const out: ScanKnowledgeChunk[] = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    if (
      out.length >= MAX_SCANNER_V2_RESPONSE_KNOWLEDGE_CHUNKS ||
      totalChars >= MAX_SCANNER_V2_RESPONSE_KNOWLEDGE_CHARS
    ) {
      break;
    }
    const remaining = MAX_SCANNER_V2_RESPONSE_KNOWLEDGE_CHARS - totalChars;
    const text = chunk.text.trim().slice(0, Math.min(1_800, remaining));
    if (!text) continue;
    out.push({
      url: chunk.canonicalUrl,
      ...(chunk.title ? { title: chunk.title } : {}),
      headingPath: [...chunk.headingPath].slice(0, 8),
      text,
      contentHash: chunk.contentHash,
    });
    totalChars += text.length;
  }
  return out;
}

function terminalState(rows: CrawlManifest["urls"]): CrawlState {
  if (rows.some((row) => row.status === "queued")) return "CRAWLING";
  if (rows.some((row) => row.status === "unresolved")) return "PARTIAL";
  return "COMPLETE";
}

async function persistManifest(
  store: FileScannerV2JobStore,
  crawlId: string,
  rows: CrawlManifest["urls"],
): Promise<CrawlManifest> {
  for (const row of rows) await store.upsertUrl(crawlId, row);
  const persisted = await store.listUrls(crawlId);
  return buildCrawlManifest({
    crawlId,
    origin: new URL(persisted[0]?.url ?? "https://invalid.example").origin,
    requestedState: terminalState(persisted),
    urls: persisted,
  });
}

function manifestFor(
  crawlId: string,
  origin: string,
  rows: CrawlManifest["urls"],
): CrawlManifest {
  return buildCrawlManifest({
    crawlId,
    origin,
    requestedState: terminalState(rows),
    urls: rows,
  });
}

async function writeJobState(
  store: FileScannerV2JobStore,
  job: CrawlJob,
  state: CrawlState,
): Promise<CrawlJob> {
  const updated = {
    ...job,
    state,
    updatedAt: new Date().toISOString(),
  };
  await store.putJob(updated);
  return updated;
}

function responseFromStore(input: {
  crawlId: string;
  origin: string;
  manifest: CrawlManifest;
  pages: CrawlPage[];
  chunks: Awaited<ReturnType<FileScannerV2JobStore["listChunks"]>>;
  extraWarnings?: readonly string[];
}): ScanResult {
  const knowledge = boundedKnowledge(input.chunks);
  const facts = mergeFacts(input.pages, input.origin);
  const draft = draftFromFacts(facts);
  const pending = input.manifest.queued > 0;
  const complete =
    !pending &&
    input.manifest.unresolved === 0 &&
    input.manifest.state === "COMPLETE";
  const warnings = new Set<string>(input.extraWarnings ?? []);

  for (const row of input.manifest.urls) {
    if (row.status === "unresolved" && row.reason) warnings.add(row.reason);
  }
  if (!complete) warnings.add("scanner_v2_partial");
  if (pending) warnings.add("scanner_v2_resume_pending");
  if (knowledge.length < input.chunks.length) {
    warnings.add("scanner_v2_response_knowledge_truncated");
  }

  if (!input.pages.length && !knowledge.length && !Object.keys(draft).length) {
    return {
      ok: false,
      error: "fetch_failed",
      message:
        "No usable public website content could be indexed. No crawl results were invented.",
      warnings: [...warnings],
    };
  }

  const scannerV2: ScannerV2ScanSummary = {
    state: complete ? "COMPLETE" : "PARTIAL",
    crawlId: input.crawlId,
    discovered: input.manifest.discovered,
    fetched: input.manifest.fetched,
    unresolved: input.manifest.unresolved,
    queued: input.manifest.queued,
    knowledgeChunks: knowledge.length,
  };

  return {
    ok: true,
    untrusted: true,
    draft,
    warnings: [...warnings],
    sources: input.pages.map((page) => ({
      url: page.canonicalUrl,
      status: 200,
      bytes: Buffer.byteLength(page.visibleText, "utf8"),
    })),
    facts,
    factMeta: {
      website: { confidence: "high", source: "fetched_url" },
    },
    ...(knowledge.length ? { knowledge } : {}),
    scannerV2,
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
      message: "Only public HTTPS websites can be scanned.",
      warnings: [allowed.reason],
    };
  }

  const releaseSha =
    options.releaseSha?.trim() ||
    process.env.SCANNER_V2_RELEASE_SHA?.trim() ||
    process.env.RAILWAY_GIT_COMMIT_SHA?.trim() ||
    "scanner-v2-runtime";
  const stateRoot = resolve(
    options.stateRoot?.trim() ||
      process.env.SCANNER_V2_STATE_ROOT?.trim() ||
      DEFAULT_SCANNER_V2_STATE_ROOT,
  );
  const batchPages = boundedInt(
    options.batchPages,
    DEFAULT_SCANNER_V2_BATCH_PAGES,
    1,
    MAX_SCANNER_V2_BATCH_PAGES,
  );
  const maxBatches = boundedInt(
    options.maxBatches,
    DEFAULT_SCANNER_V2_MAX_BATCHES,
    1,
    MAX_SCANNER_V2_MAX_BATCHES,
  );
  const timeBudgetMs = boundedInt(
    options.timeBudgetMs,
    DEFAULT_SCANNER_V2_TIME_BUDGET_MS,
    5_000,
    MAX_SCANNER_V2_TIME_BUDGET_MS,
  );
  const maxDiscoveredUrls = boundedInt(
    options.maxDiscoveredUrls,
    DEFAULT_SCANNER_V2_MAX_DISCOVERED_URLS,
    10,
    10_000,
  );

  const origin = allowed.url.origin;
  const crawlId =
    "v2-" +
    stableContentHash(allowed.url.toString() + "\u0000" + releaseSha).slice(
      0,
      32,
    );
  const store = new FileScannerV2JobStore(stateRoot);
  let job = await createScannerV2Job({
    store,
    crawlId,
    origin,
    releaseSha,
    urls: [
      {
        url: allowed.url.toString(),
        status: "queued",
        discoveryReason: "submitted",
      },
    ],
  });

  let rows = await store.listUrls(crawlId);
  let manifest = manifestFor(crawlId, origin, rows);
  const deadline = Date.now() + timeBudgetMs;
  const warnings = new Set<string>();

  if (job.state !== "COMPLETE" && job.state !== "PARTIAL") {
    for (let batch = 0; batch < maxBatches; batch += 1) {
      if (Date.now() >= deadline || manifest.queued === 0) break;

      const discovered = await discoverScannerV2Frontier(
        allowed.url.toString(),
        {
          ...(options.discovery ?? {}),
          maxHtmlPages: batchPages,
          maxDiscoveredUrls,
          resumeManifest: manifest,
          onHtmlPage: async (pageInput) => {
            const extracted = extractScannerV2Page(pageInput);
            await store.putPage(crawlId, extracted.page);
            await store.putChunks(crawlId, extracted.chunks);
          },
        },
      );
      discovered.warnings.forEach((warning) => warnings.add(warning));

      for (const row of discovered.manifest.urls) {
        await store.upsertUrl(crawlId, row);
      }
      rows = await store.listUrls(crawlId);
      manifest = manifestFor(crawlId, origin, rows);
      job = await writeJobState(store, job, manifest.state);

      if (manifest.queued === 0) break;
    }
  }

  rows = await store.listUrls(crawlId);
  manifest = manifestFor(crawlId, origin, rows);

  if (manifest.queued === 0 && job.state !== "COMPLETE" && job.state !== "PARTIAL") {
    job = await writeJobState(store, job, "INDEXING");
    try {
      const documents = await ingestScannerV2ManifestDocuments(manifest);
      documents.warnings.forEach((warning) => warnings.add(warning));
      for (const page of documents.pages) await store.putPage(crawlId, page);
      await store.putChunks(crawlId, documents.chunks);
      for (const row of documents.manifest.urls) {
        await store.upsertUrl(crawlId, row);
      }
    } catch {
      warnings.add("document_ingest_failed");
    }

    rows = await store.listUrls(crawlId);
    manifest = manifestFor(crawlId, origin, rows);
    job = await writeJobState(store, job, terminalState(rows));
  } else if (manifest.queued > 0) {
    job = await writeJobState(store, job, "CRAWLING");
  }

  const pages = await store.listPages(crawlId);
  const chunks = await store.listChunks(crawlId);
  const finalRows = await store.listUrls(crawlId);
  const finalManifest = manifestFor(crawlId, origin, finalRows);

  return responseFromStore({
    crawlId,
    origin,
    manifest: finalManifest,
    pages,
    chunks,
    extraWarnings: [...warnings],
  });
}
