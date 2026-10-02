import {
  mkdir,
  open,
  readFile,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  DEFAULT_MAX_BYTES_PER_PAGE,
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
  isHtmlOrText,
} from "./fetch-safe.ts";
import { extractScannerV2Page } from "./scanner-v2-content.ts";
import { stableContentHash } from "./scanner-v2-foundation.ts";
import {
  createScannerV2Job,
  type ScannerV2JobStore,
  type ScannerV2ProcessUrl,
} from "./scanner-v2-worker.ts";
import type {
  CorpusChunk,
  CrawlJob,
  CrawlPage,
  CrawlUrlDisposition,
  HttpGetFn,
  LookupFn,
} from "./types.ts";

export type ScannerV2RefreshVersion = {
  origin: string;
  crawlId: string;
  releaseSha: string;
  committedAt: string;
};

export type ScannerV2RefreshOptions = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
};

export type ScannerV2RefreshSeed = {
  urls: CrawlUrlDisposition[];
  inheritedForConfirmation: number;
};

function headerValue(
  headers: Record<string, string>,
  name: string,
): string | undefined {
  const want = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === want && value.trim()) return value.trim();
  }
  return undefined;
}

export function buildScannerV2ConditionalHeaders(
  page: CrawlPage | undefined,
): Record<string, string> {
  if (!page) return {};
  const headers: Record<string, string> = {};
  if (page.etag) headers["If-None-Match"] = page.etag;
  if (page.lastModified) headers["If-Modified-Since"] = page.lastModified;
  return headers;
}

/**
 * Build a refresh frontier from the newly discovered site plus prior fetched
 * pages that disappeared from discovery. Missing prior pages are queued once
 * so 404/410 can be confirmed rather than silently deleting knowledge.
 */
export function buildScannerV2RefreshSeed(input: {
  currentUrls: readonly CrawlUrlDisposition[];
  previousUrls: readonly CrawlUrlDisposition[];
}): ScannerV2RefreshSeed {
  const rows = new Map<string, CrawlUrlDisposition>();

  for (const row of input.currentUrls) {
    const next =
      row.status === "fetched" || row.status === "unresolved"
        ? {
            ...row,
            status: "queued" as const,
            reason: undefined,
            retryCount: 0,
            lastAttemptAt: undefined,
          }
        : { ...row };
    rows.set(next.url, next);
  }

  let inheritedForConfirmation = 0;
  for (const row of input.previousUrls) {
    if (row.status !== "fetched" || rows.has(row.url)) continue;
    rows.set(row.url, {
      ...row,
      status: "queued",
      reason: "refresh_confirm_absent",
      retryCount: 0,
      lastAttemptAt: undefined,
    });
    inheritedForConfirmation += 1;
  }

  return {
    urls: [...rows.values()].sort((a, b) => a.url.localeCompare(b.url)),
    inheritedForConfirmation,
  };
}

export async function createScannerV2RefreshJob(input: {
  store: ScannerV2JobStore;
  previousCrawlId: string;
  crawlId: string;
  origin: string;
  releaseSha: string;
  currentUrls: readonly CrawlUrlDisposition[];
  createdAt?: string;
  retryLimit?: number;
}): Promise<{ job: CrawlJob; seed: ScannerV2RefreshSeed }> {
  if (input.previousCrawlId === input.crawlId) {
    throw new Error("scanner_v2_refresh_requires_new_crawl_id");
  }

  const previousJob = await input.store.getJob(input.previousCrawlId);
  if (!previousJob) throw new Error("scanner_v2_previous_crawl_not_found");
  if (previousJob.origin !== input.origin) {
    throw new Error("scanner_v2_refresh_origin_mismatch");
  }
  if (previousJob.state !== "COMPLETE") {
    throw new Error("scanner_v2_refresh_requires_complete_previous_crawl");
  }

  const seed = buildScannerV2RefreshSeed({
    currentUrls: input.currentUrls,
    previousUrls: await input.store.listUrls(input.previousCrawlId),
  });

  const job = await createScannerV2Job({
    store: input.store,
    crawlId: input.crawlId,
    origin: input.origin,
    releaseSha: input.releaseSha,
    urls: seed.urls,
    ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    ...(input.retryLimit !== undefined
      ? { retryLimit: input.retryLimit }
      : {}),
  });

  return { job, seed };
}

function groupChunksByCanonicalUrl(
  chunks: readonly CorpusChunk[],
): Map<string, CorpusChunk[]> {
  const grouped = new Map<string, CorpusChunk[]>();
  for (const chunk of chunks) {
    const list = grouped.get(chunk.canonicalUrl) ?? [];
    list.push(structuredClone(chunk));
    grouped.set(chunk.canonicalUrl, list);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.ordinal - b.ordinal);
  }
  return grouped;
}

function clonePage(page: CrawlPage): CrawlPage {
  return structuredClone(page);
}

/**
 * Create a Stage 9 worker processor that revalidates against one immutable,
 * COMPLETE prior crawl. Unchanged 304 responses reuse exact prior chunks.
 * Changed 200 responses re-extract only that page. 404/410 are tombstoned by
 * omitting page/chunks from the new crawl. The prior crawl is never mutated.
 */
export async function createScannerV2RefreshProcessor(input: {
  store: ScannerV2JobStore;
  previousCrawlId: string;
  options?: ScannerV2RefreshOptions;
}): Promise<ScannerV2ProcessUrl> {
  const previousJob = await input.store.getJob(input.previousCrawlId);
  if (!previousJob || previousJob.state !== "COMPLETE") {
    throw new Error("scanner_v2_refresh_requires_complete_previous_crawl");
  }

  const previousUrls = new Map(
    (await input.store.listUrls(input.previousCrawlId)).map((row) => [
      row.url,
      row,
    ]),
  );
  const previousPages = new Map(
    (await input.store.listPages(input.previousCrawlId)).map((page) => [
      page.canonicalUrl,
      page,
    ]),
  );
  const previousChunks = groupChunksByCanonicalUrl(
    await input.store.listChunks(input.previousCrawlId),
  );

  const options = input.options ?? {};

  return async ({ url }) => {
    const oldRow = previousUrls.get(url.url);
    const oldCanonical =
      oldRow?.canonicalUrl ?? url.canonicalUrl ?? url.url;
    const oldPage = previousPages.get(oldCanonical);
    const conditionalHeaders = buildScannerV2ConditionalHeaders(oldPage);

    const response = await fetchPublicHttps(url.url, {
      lookup: options.lookup,
      get: options.get,
      timeoutMs: options.timeoutMs ?? DEFAULT_PAGE_TIMEOUT_MS,
      maxBytes: options.maxBytes ?? DEFAULT_MAX_BYTES_PER_PAGE,
      maxRedirects: options.maxRedirects ?? DEFAULT_MAX_REDIRECTS,
      headers: conditionalHeaders,
    });

    if (response.status === 304) {
      if (!oldPage) {
        return {
          disposition: "unresolved",
          reason: "not_modified_without_prior_page",
          canonicalUrl: oldCanonical,
        };
      }
      return {
        disposition: "fetched",
        reason: "not_modified_reused",
        canonicalUrl: oldPage.canonicalUrl,
        page: clonePage(oldPage),
        chunks: (previousChunks.get(oldPage.canonicalUrl) ?? []).map(
          (chunk) => structuredClone(chunk),
        ),
      };
    }

    if (response.status === 404 || response.status === 410) {
      return {
        disposition: "policy_skipped",
        reason: `tombstone_http_${response.status}`,
        canonicalUrl: oldCanonical,
      };
    }

    if (response.status >= 400) {
      return {
        disposition: "unresolved",
        reason: `refresh_http_${response.status}`,
        canonicalUrl: oldCanonical,
      };
    }

    const contentType =
      headerValue(response.headers, "content-type") ?? "";
    if (!isHtmlOrText(contentType)) {
      return {
        disposition: "policy_skipped",
        reason: "refresh_content_type_not_text",
        canonicalUrl: oldCanonical,
      };
    }

    const extracted = extractScannerV2Page({
      requestedUrl: url.url,
      canonicalUrl: response.url.toString(),
      html: response.body,
      contentType: contentType || "text/html",
      fetchMode: "http",
      headers: response.headers,
    });

    if (oldPage && extracted.page.contentHash === oldPage.contentHash) {
      return {
        disposition: "fetched",
        reason: "content_hash_reused",
        canonicalUrl: extracted.page.canonicalUrl,
        page: extracted.page,
        chunks: (previousChunks.get(oldPage.canonicalUrl) ?? []).map(
          (chunk) => structuredClone(chunk),
        ),
      };
    }

    return {
      disposition: "fetched",
      reason: oldPage ? "content_changed" : "content_new",
      canonicalUrl: extracted.page.canonicalUrl,
      page: extracted.page,
      chunks: extracted.chunks,
    };
  };
}

export interface ScannerV2VersionStore {
  getActive(origin: string): Promise<ScannerV2RefreshVersion | undefined>;
  compareAndSwapActive(input: {
    next: ScannerV2RefreshVersion;
    expectedPreviousCrawlId?: string | null;
  }): Promise<boolean>;
}

async function readVersionJson(
  path: string,
): Promise<ScannerV2RefreshVersion | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as ScannerV2RefreshVersion;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return undefined;
    throw error;
  }
}

async function atomicWriteVersion(
  path: string,
  value: ScannerV2RefreshVersion,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}-${Date.now()}`;
  const handle = await open(temp, "w", 0o600);
  try {
    await handle.writeFile(JSON.stringify(value, null, 2) + "\n", "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temp, path);
}

export class FileScannerV2VersionStore implements ScannerV2VersionStore {
  readonly root: string;
  readonly lockStaleMs: number;

  constructor(root: string, options: { lockStaleMs?: number } = {}) {
    this.root = resolve(root);
    this.lockStaleMs = Math.max(
      5_000,
      Math.min(5 * 60_000, options.lockStaleMs ?? 60_000),
    );
  }

  private key(origin: string): string {
    return stableContentHash(origin);
  }

  private pointerPath(origin: string): string {
    return join(this.root, "active", this.key(origin) + ".json");
  }

  private lockPath(origin: string): string {
    return join(this.root, "active", this.key(origin) + ".lock");
  }

  async getActive(
    origin: string,
  ): Promise<ScannerV2RefreshVersion | undefined> {
    return readVersionJson(this.pointerPath(origin));
  }

  private async acquireCommitLock(origin: string): Promise<boolean> {
    const path = this.lockPath(origin);
    await mkdir(dirname(path), { recursive: true });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const handle = await open(path, "wx", 0o600);
        try {
          await handle.writeFile(
            JSON.stringify({
              pid: process.pid,
              createdAt: new Date().toISOString(),
            }) + "\n",
            "utf8",
          );
          await handle.sync();
        } finally {
          await handle.close();
        }
        return true;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "EEXIST") throw error;
        try {
          const info = await stat(path);
          if (Date.now() - info.mtimeMs > this.lockStaleMs) {
            await rm(path, { force: true });
            continue;
          }
        } catch (statError) {
          const statCode = (statError as NodeJS.ErrnoException).code;
          if (statCode === "ENOENT") continue;
          throw statError;
        }
        return false;
      }
    }
    return false;
  }

  async compareAndSwapActive(input: {
    next: ScannerV2RefreshVersion;
    expectedPreviousCrawlId?: string | null;
  }): Promise<boolean> {
    const origin = input.next.origin;
    if (!(await this.acquireCommitLock(origin))) return false;

    try {
      const current = await this.getActive(origin);
      if (input.expectedPreviousCrawlId !== undefined) {
        const currentId = current?.crawlId ?? null;
        if (currentId !== input.expectedPreviousCrawlId) return false;
      }
      await atomicWriteVersion(this.pointerPath(origin), input.next);
      return true;
    } finally {
      await rm(this.lockPath(origin), { force: true });
    }
  }
}

/**
 * Atomically publish one COMPLETE crawl as the active corpus version.
 * PARTIAL/CRAWLING jobs can never replace the previously active corpus.
 */
export async function commitScannerV2CrawlVersion(input: {
  jobStore: ScannerV2JobStore;
  versionStore: ScannerV2VersionStore;
  crawlId: string;
  expectedPreviousCrawlId?: string | null;
  committedAt?: string;
}): Promise<ScannerV2RefreshVersion> {
  const job = await input.jobStore.getJob(input.crawlId);
  if (!job) throw new Error("scanner_v2_refresh_job_not_found");
  if (job.state !== "COMPLETE") {
    throw new Error("scanner_v2_refresh_commit_requires_complete");
  }

  const rows = await input.jobStore.listUrls(input.crawlId);
  if (
    rows.some(
      (row) => row.status === "queued" || row.status === "unresolved",
    )
  ) {
    throw new Error("scanner_v2_refresh_commit_manifest_not_complete");
  }

  const next: ScannerV2RefreshVersion = {
    origin: job.origin,
    crawlId: job.crawlId,
    releaseSha: job.releaseSha,
    committedAt: input.committedAt ?? new Date().toISOString(),
  };

  const committed = await input.versionStore.compareAndSwapActive({
    next,
    ...(input.expectedPreviousCrawlId !== undefined
      ? { expectedPreviousCrawlId: input.expectedPreviousCrawlId }
      : {}),
  });
  if (!committed) {
    throw new Error("scanner_v2_refresh_commit_conflict");
  }
  return next;
}

