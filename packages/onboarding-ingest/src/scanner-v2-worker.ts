import {
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  buildCrawlManifest,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import type {
  CorpusChunk,
  CrawlJob,
  CrawlLease,
  CrawlManifest,
  CrawlPage,
  CrawlState,
  CrawlUrlDisposition,
} from "./types.ts";

export const DEFAULT_WORKER_BATCH_SIZE = 8;
export const DEFAULT_WORKER_LEASE_MS = 60_000;
export const DEFAULT_WORKER_RETRY_LIMIT = 3;

export type ScannerV2ProcessResult = {
  disposition:
    | "fetched"
    | "duplicate"
    | "policy_skipped"
    | "robots_skipped"
    | "unresolved";
  reason?: string;
  canonicalUrl?: string;
  page?: CrawlPage;
  chunks?: CorpusChunk[];
};

export type ScannerV2ProcessUrl = (input: {
  crawlId: string;
  url: CrawlUrlDisposition;
  workerId: string;
}) => Promise<ScannerV2ProcessResult>;

export type ScannerV2WorkerBatchResult = {
  crawlId: string;
  workerId: string;
  attempted: number;
  completed: number;
  failed: number;
  deferred: number;
  hasMoreWork: boolean;
  nextAction: "schedule_next_batch" | "complete";
  manifest: CrawlManifest;
  state: CrawlState;
};

export interface ScannerV2JobStore {
  putJob(job: CrawlJob): Promise<void>;
  getJob(crawlId: string): Promise<CrawlJob | undefined>;
  listUrls(crawlId: string): Promise<CrawlUrlDisposition[]>;
  getUrl(crawlId: string, url: string): Promise<CrawlUrlDisposition | undefined>;
  upsertUrl(crawlId: string, disposition: CrawlUrlDisposition): Promise<void>;
  getLease(crawlId: string, leaseKey: string): Promise<CrawlLease | undefined>;
  listPages(crawlId: string): Promise<CrawlPage[]>;
  putPage(crawlId: string, page: CrawlPage): Promise<void>;
  listChunks(crawlId: string): Promise<CorpusChunk[]>;
  putChunks(crawlId: string, chunks: readonly CorpusChunk[]): Promise<void>;
  acquireLease(lease: CrawlLease, nowIso?: string): Promise<boolean>;
  releaseLease(
    crawlId: string,
    leaseKey: string,
    owner: string,
  ): Promise<boolean>;
}

function safeId(value: string): string {
  return Buffer.from(stableContentHash(value), "hex").toString("hex");
}

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return undefined;
    throw error;
  }
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
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

async function listJsonFiles<T>(dir: string): Promise<T[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }

  const out: T[] = [];
  for (const name of names.sort()) {
    if (!name.endsWith(".json")) continue;
    const item = await readJson<T>(join(dir, name));
    if (item !== undefined) out.push(item);
  }
  return out;
}

/**
 * Minimal durable Stage 9 store.
 *
 * Each crawl is a self-contained directory of small JSON records. Writes are
 * temp+rename atomic. URL leases use O_EXCL files, so multiple processes cannot
 * claim the same live lease. This deliberately reuses the worker filesystem
 * instead of introducing a new database/service.
 */
export class FileScannerV2JobStore implements ScannerV2JobStore {
  readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  private crawlDir(crawlId: string): string {
    return join(this.root, safeId(crawlId));
  }

  private jobPath(crawlId: string): string {
    return join(this.crawlDir(crawlId), "job.json");
  }

  private recordPath(
    crawlId: string,
    bucket: "urls" | "pages" | "chunks" | "leases",
    key: string,
  ): string {
    return join(this.crawlDir(crawlId), bucket, safeId(key) + ".json");
  }

  async putJob(job: CrawlJob): Promise<void> {
    await atomicWriteJson(this.jobPath(job.crawlId), job);
  }

  async getJob(crawlId: string): Promise<CrawlJob | undefined> {
    return readJson<CrawlJob>(this.jobPath(crawlId));
  }

  async listUrls(crawlId: string): Promise<CrawlUrlDisposition[]> {
    return (
      await listJsonFiles<CrawlUrlDisposition>(
        join(this.crawlDir(crawlId), "urls"),
      )
    ).sort((a, b) => a.url.localeCompare(b.url));
  }

  async getUrl(
    crawlId: string,
    url: string,
  ): Promise<CrawlUrlDisposition | undefined> {
    return readJson<CrawlUrlDisposition>(
      this.recordPath(crawlId, "urls", url),
    );
  }

  async upsertUrl(
    crawlId: string,
    disposition: CrawlUrlDisposition,
  ): Promise<void> {
    await atomicWriteJson(
      this.recordPath(crawlId, "urls", disposition.url),
      disposition,
    );
  }

  async listPages(crawlId: string): Promise<CrawlPage[]> {
    return (
      await listJsonFiles<CrawlPage>(join(this.crawlDir(crawlId), "pages"))
    ).sort((a, b) => a.canonicalUrl.localeCompare(b.canonicalUrl));
  }

  async putPage(crawlId: string, page: CrawlPage): Promise<void> {
    await atomicWriteJson(
      this.recordPath(crawlId, "pages", page.canonicalUrl),
      page,
    );
  }

  async listChunks(crawlId: string): Promise<CorpusChunk[]> {
    return (
      await listJsonFiles<CorpusChunk>(join(this.crawlDir(crawlId), "chunks"))
    ).sort((a, b) =>
      a.canonicalUrl === b.canonicalUrl
        ? a.ordinal - b.ordinal
        : a.canonicalUrl.localeCompare(b.canonicalUrl),
    );
  }

  async putChunks(
    crawlId: string,
    chunks: readonly CorpusChunk[],
  ): Promise<void> {
    for (const chunk of chunks) {
      await atomicWriteJson(
        this.recordPath(crawlId, "chunks", chunk.id),
        chunk,
      );
    }
  }

  async acquireLease(
    lease: CrawlLease,
    nowIso = new Date().toISOString(),
  ): Promise<boolean> {
    const path = this.recordPath(lease.crawlId, "leases", lease.leaseKey);
    await mkdir(dirname(path), { recursive: true });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const handle = await open(path, "wx", 0o600);
        try {
          await handle.writeFile(JSON.stringify(lease) + "\n", "utf8");
          await handle.sync();
        } finally {
          await handle.close();
        }
        return true;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "EEXIST") throw error;

        const current = await readJson<CrawlLease>(path);
        if (!current) continue;

        if (
          current.owner === lease.owner ||
          Date.parse(current.expiresAt) <= Date.parse(nowIso)
        ) {
          await rm(path, { force: true });
          continue;
        }
        return false;
      }
    }
    return false;
  }

  async getLease(
    crawlId: string,
    leaseKey: string,
  ): Promise<CrawlLease | undefined> {
    return readJson<CrawlLease>(
      this.recordPath(crawlId, "leases", leaseKey),
    );
  }

  async releaseLease(
    crawlId: string,
    leaseKey: string,
    owner: string,
  ): Promise<boolean> {
    const path = this.recordPath(crawlId, "leases", leaseKey);
    const current = await readJson<CrawlLease>(path);
    if (!current || current.owner !== owner) return false;
    await rm(path, { force: true });
    return true;
  }
}

export async function createScannerV2Job(input: {
  store: ScannerV2JobStore;
  crawlId: string;
  origin: string;
  releaseSha: string;
  urls: readonly CrawlUrlDisposition[];
  createdAt?: string;
  retryLimit?: number;
}): Promise<CrawlJob> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const requestedRetryLimit = input.retryLimit;
  const retryLimit = Number.isFinite(requestedRetryLimit)
    ? Math.max(1, Math.min(10, Math.trunc(requestedRetryLimit as number)))
    : DEFAULT_WORKER_RETRY_LIMIT;
  const existing = await input.store.getJob(input.crawlId);
  if (
    existing &&
    (existing.origin !== input.origin ||
      existing.releaseSha !== input.releaseSha)
  ) {
    throw new Error("scanner_v2_job_identity_mismatch");
  }

  const job: CrawlJob =
    existing ?? {
      crawlId: input.crawlId,
      origin: input.origin,
      state: "CRAWLING",
      releaseSha: input.releaseSha,
      createdAt,
      updatedAt: createdAt,
      retryLimit,
    };
  if (!existing) await input.store.putJob(job);

  // Re-running creation is also crash recovery for a process that wrote the
  // job record but died while seeding the frontier. Existing terminal rows are
  // never overwritten by the original queued seed.
  for (const row of input.urls) {
    if (await input.store.getUrl(input.crawlId, row.url)) continue;
    await input.store.upsertUrl(input.crawlId, {
      ...row,
      retryCount: row.retryCount ?? 0,
    });
  }
  return job;
}

function safeErrorReason(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "worker_error";
  return raw.replace(/[\r\n\t]+/g, " ").slice(0, 240) || "worker_error";
}

async function finaliseManifest(
  store: ScannerV2JobStore,
  job: CrawlJob,
  nowIso: string,
): Promise<{ job: CrawlJob; manifest: CrawlManifest; hasMoreWork: boolean }> {
  const urls = await store.listUrls(job.crawlId);
  const hasQueued = urls.some((row) => row.status === "queued");
  const hasUnresolved = urls.some((row) => row.status === "unresolved");
  const hasFetchedEvidence = urls.some(
    (row) => row.status === "fetched" || row.status === "duplicate",
  );

  const state: CrawlState = hasQueued
    ? "CRAWLING"
    : hasUnresolved || !hasFetchedEvidence
      ? "PARTIAL"
      : "COMPLETE";

  const updated: CrawlJob = {
    ...job,
    state,
    updatedAt: nowIso,
  };
  await store.putJob(updated);

  return {
    job: updated,
    manifest: buildCrawlManifest({
      crawlId: job.crawlId,
      origin: job.origin,
      requestedState: state,
      urls,
    }),
    hasMoreWork: hasQueued,
  };
}

export async function runScannerV2WorkerBatch(input: {
  store: ScannerV2JobStore;
  crawlId: string;
  workerId: string;
  processUrl: ScannerV2ProcessUrl;
  batchSize?: number;
  leaseMs?: number;
  now?: () => Date;
}): Promise<ScannerV2WorkerBatchResult> {
  const job = await input.store.getJob(input.crawlId);
  if (!job) throw new Error("scanner_v2_job_not_found");

  const requestedBatchSize = input.batchSize;
  const requestedLeaseMs = input.leaseMs;
  const batchSize = Number.isFinite(requestedBatchSize)
    ? Math.max(1, Math.min(64, Math.trunc(requestedBatchSize as number)))
    : DEFAULT_WORKER_BATCH_SIZE;
  const leaseMs = Number.isFinite(requestedLeaseMs)
    ? Math.max(1_000, Math.min(15 * 60_000, Math.trunc(requestedLeaseMs as number)))
    : DEFAULT_WORKER_LEASE_MS;
  const now = input.now ?? (() => new Date());

  let attempted = 0;
  let completed = 0;
  let failed = 0;
  let deferred = 0;

  const queued = (await input.store.listUrls(job.crawlId))
    .filter((row) => row.status === "queued")
    .slice(0, batchSize * 4);

  for (const candidate of queued) {
    if (attempted >= batchSize) break;

    const current = await input.store.getUrl(job.crawlId, candidate.url);
    if (!current || current.status !== "queued") continue;

    const attemptTime = now();
    const attemptIso = attemptTime.toISOString();
    const lease: CrawlLease = {
      crawlId: job.crawlId,
      leaseKey: current.url,
      owner: input.workerId,
      expiresAt: new Date(attemptTime.getTime() + leaseMs).toISOString(),
    };
    if (!(await input.store.acquireLease(lease, attemptIso))) {
      deferred += 1;
      continue;
    }

    attempted += 1;
    try {
      const outcome = await input.processUrl({
        crawlId: job.crawlId,
        url: structuredClone(current),
        workerId: input.workerId,
      });

      // A slow worker must never commit after its lease expired or was
      // reassigned. Check both owner and exact lease generation immediately
      // before durable writes.
      const commitTime = now();
      const activeLease = await input.store.getLease(
        job.crawlId,
        current.url,
      );
      if (
        !activeLease ||
        activeLease.owner !== input.workerId ||
        activeLease.expiresAt !== lease.expiresAt ||
        Date.parse(activeLease.expiresAt) <= commitTime.getTime()
      ) {
        deferred += 1;
        continue;
      }

      let status = outcome.disposition;
      let canonicalUrl = outcome.canonicalUrl ?? outcome.page?.canonicalUrl;
      let reason = outcome.reason;
      let page = outcome.page;

      if (status === "fetched" && !page) {
        throw new Error("fetched_outcome_missing_page");
      }

      if (page) {
        const sameHash = (await input.store.listPages(job.crawlId)).find(
          (existing) =>
            existing.contentHash === page?.contentHash &&
            existing.canonicalUrl !== page?.canonicalUrl,
        );
        if (sameHash) {
          status = "duplicate";
          canonicalUrl = sameHash.canonicalUrl;
          reason = "content_hash_duplicate";
          page = undefined;
        }
      }

      if (page) await input.store.putPage(job.crawlId, page);
      if (outcome.chunks?.length && page) {
        await input.store.putChunks(job.crawlId, outcome.chunks);
      }

      await input.store.upsertUrl(job.crawlId, {
        ...current,
        status,
        ...(canonicalUrl ? { canonicalUrl } : {}),
        ...(reason ? { reason } : {}),
        ...(page?.contentHash ? { contentHash: page.contentHash } : {}),
        ...(page?.fetchedAt ? { fetchedAt: page.fetchedAt } : {}),
        retryCount: current.retryCount ?? 0,
        lastAttemptAt: attemptIso,
      });
      completed += 1;
    } catch (error) {
      const retryCount = (current.retryCount ?? 0) + 1;
      const exhausted = retryCount >= job.retryLimit;
      await input.store.upsertUrl(job.crawlId, {
        ...current,
        status: exhausted ? "unresolved" : "queued",
        reason: exhausted
          ? `retry_exhausted:${safeErrorReason(error)}`
          : `retry_pending:${safeErrorReason(error)}`,
        retryCount,
        lastAttemptAt: attemptIso,
      });
      failed += 1;
    } finally {
      await input.store.releaseLease(
        job.crawlId,
        current.url,
        input.workerId,
      );
    }
  }

  const finishTime = now().toISOString();
  const final = await finaliseManifest(input.store, job, finishTime);
  return {
    crawlId: job.crawlId,
    workerId: input.workerId,
    attempted,
    completed,
    failed,
    deferred,
    hasMoreWork: final.hasMoreWork,
    nextAction: final.hasMoreWork ? "schedule_next_batch" : "complete",
    manifest: final.manifest,
    state: final.job.state,
  };
}

