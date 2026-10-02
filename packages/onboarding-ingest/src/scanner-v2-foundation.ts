import { createHash } from "node:crypto";
import type {
  CorpusChunk,
  CrawlLease,
  CrawlManifest,
  CrawlPage,
  CrawlState,
  CrawlUrlDisposition,
} from "./types.ts";

export const SCANNER_V2_ENV = "ONBOARDING_SCANNER_V2";

export function isScannerV2Enabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env[SCANNER_V2_ENV];
  return value === "true" || value === "1";
}

function sha256(parts: readonly string[]): string {
  const hash = createHash("sha256");
  for (const part of parts) {
    hash.update(part, "utf8");
    hash.update("\u0000", "utf8");
  }
  return hash.digest("hex");
}

/**
 * Stable exact-text content hash. Normalise line endings only so the same
 * public representation does not get a different identity on Windows/Linux.
 */
export function stableContentHash(text: string): string {
  return sha256([text.replace(/\r\n?/g, "\n")]);
}

/**
 * Chunk IDs are independent of crawlId so unchanged chunks keep stable
 * identity across future incremental recrawls.
 */
export function stableChunkId(
  canonicalUrl: string,
  ordinal: number,
  text: string,
): string {
  return sha256([
    canonicalUrl,
    String(ordinal),
    stableContentHash(text),
  ]);
}

export interface CorpusStore {
  putPage(crawlId: string, page: CrawlPage): Promise<void>;
  getPage(crawlId: string, canonicalUrl: string): Promise<CrawlPage | undefined>;
  listPages(crawlId: string): Promise<CrawlPage[]>;
  putChunks(crawlId: string, chunks: readonly CorpusChunk[]): Promise<void>;
  listChunks(crawlId: string): Promise<CorpusChunk[]>;
}

export interface FrontierStore {
  upsertUrl(crawlId: string, disposition: CrawlUrlDisposition): Promise<void>;
  getUrl(crawlId: string, url: string): Promise<CrawlUrlDisposition | undefined>;
  listUrls(crawlId: string): Promise<CrawlUrlDisposition[]>;
}

export interface CrawlLeaseStore {
  acquireLease(lease: CrawlLease, nowIso?: string): Promise<boolean>;
  getLease(crawlId: string, leaseKey: string): Promise<CrawlLease | undefined>;
  releaseLease(crawlId: string, leaseKey: string, owner: string): Promise<boolean>;
}

function sortedDispositions(
  dispositions: readonly CrawlUrlDisposition[],
): CrawlUrlDisposition[] {
  return [...dispositions].sort((a, b) =>
    a.url.localeCompare(b.url, "en", { sensitivity: "variant" }),
  );
}

/**
 * Build the manifest from URL dispositions. COMPLETE is legal only when the
 * frontier is exhausted and there are no unresolved URLs. If callers request
 * COMPLETE too early we downgrade to PARTIAL rather than silently lying.
 */
export function buildCrawlManifest(input: {
  crawlId: string;
  origin: string;
  requestedState: CrawlState;
  urls: readonly CrawlUrlDisposition[];
}): CrawlManifest {
  const urls = sortedDispositions(input.urls);
  const counts = {
    queued: urls.filter((item) => item.status === "queued").length,
    fetched: urls.filter((item) => item.status === "fetched").length,
    duplicate: urls.filter((item) => item.status === "duplicate").length,
    policySkipped: urls.filter((item) => item.status === "policy_skipped").length,
    robotsSkipped: urls.filter((item) => item.status === "robots_skipped").length,
    unresolved: urls.filter((item) => item.status === "unresolved").length,
  };

  const state =
    input.requestedState === "COMPLETE" &&
    (counts.queued > 0 || counts.unresolved > 0)
      ? "PARTIAL"
      : input.requestedState;

  return {
    crawlId: input.crawlId,
    origin: input.origin,
    state,
    discovered: urls.length,
    ...counts,
    urls,
  };
}

export class InMemoryScannerV2Store
  implements CorpusStore, FrontierStore, CrawlLeaseStore
{
  private readonly pages = new Map<string, Map<string, CrawlPage>>();
  private readonly chunks = new Map<string, Map<string, CorpusChunk>>();
  private readonly urls = new Map<string, Map<string, CrawlUrlDisposition>>();
  private readonly leases = new Map<string, Map<string, CrawlLease>>();

  async putPage(crawlId: string, page: CrawlPage): Promise<void> {
    let bucket = this.pages.get(crawlId);
    if (!bucket) {
      bucket = new Map();
      this.pages.set(crawlId, bucket);
    }
    bucket.set(page.canonicalUrl, structuredClone(page));
  }

  async getPage(
    crawlId: string,
    canonicalUrl: string,
  ): Promise<CrawlPage | undefined> {
    const page = this.pages.get(crawlId)?.get(canonicalUrl);
    return page ? structuredClone(page) : undefined;
  }

  async listPages(crawlId: string): Promise<CrawlPage[]> {
    return [...(this.pages.get(crawlId)?.values() ?? [])]
      .map((page) => structuredClone(page))
      .sort((a, b) => a.canonicalUrl.localeCompare(b.canonicalUrl));
  }

  async putChunks(
    crawlId: string,
    chunks: readonly CorpusChunk[],
  ): Promise<void> {
    let bucket = this.chunks.get(crawlId);
    if (!bucket) {
      bucket = new Map();
      this.chunks.set(crawlId, bucket);
    }
    for (const chunk of chunks) {
      bucket.set(chunk.id, structuredClone(chunk));
    }
  }

  async listChunks(crawlId: string): Promise<CorpusChunk[]> {
    return [...(this.chunks.get(crawlId)?.values() ?? [])]
      .map((chunk) => structuredClone(chunk))
      .sort((a, b) =>
        a.canonicalUrl === b.canonicalUrl
          ? a.ordinal - b.ordinal
          : a.canonicalUrl.localeCompare(b.canonicalUrl),
      );
  }

  async upsertUrl(
    crawlId: string,
    disposition: CrawlUrlDisposition,
  ): Promise<void> {
    let bucket = this.urls.get(crawlId);
    if (!bucket) {
      bucket = new Map();
      this.urls.set(crawlId, bucket);
    }
    bucket.set(disposition.url, structuredClone(disposition));
  }

  async getUrl(
    crawlId: string,
    url: string,
  ): Promise<CrawlUrlDisposition | undefined> {
    const item = this.urls.get(crawlId)?.get(url);
    return item ? structuredClone(item) : undefined;
  }

  async listUrls(crawlId: string): Promise<CrawlUrlDisposition[]> {
    return sortedDispositions([
      ...(this.urls.get(crawlId)?.values() ?? []),
    ]).map((item) => structuredClone(item));
  }

  async acquireLease(
    lease: CrawlLease,
    nowIso = new Date().toISOString(),
  ): Promise<boolean> {
    let bucket = this.leases.get(lease.crawlId);
    if (!bucket) {
      bucket = new Map();
      this.leases.set(lease.crawlId, bucket);
    }
    const current = bucket.get(lease.leaseKey);
    if (
      current &&
      Date.parse(current.expiresAt) > Date.parse(nowIso) &&
      current.owner !== lease.owner
    ) {
      return false;
    }
    bucket.set(lease.leaseKey, structuredClone(lease));
    return true;
  }

  async getLease(
    crawlId: string,
    leaseKey: string,
  ): Promise<CrawlLease | undefined> {
    const lease = this.leases.get(crawlId)?.get(leaseKey);
    return lease ? structuredClone(lease) : undefined;
  }

  async releaseLease(
    crawlId: string,
    leaseKey: string,
    owner: string,
  ): Promise<boolean> {
    const bucket = this.leases.get(crawlId);
    const current = bucket?.get(leaseKey);
    if (!bucket || !current || current.owner !== owner) return false;
    return bucket.delete(leaseKey);
  }
}
