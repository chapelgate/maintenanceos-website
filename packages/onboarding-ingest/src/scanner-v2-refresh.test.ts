import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildScannerV2ConditionalHeaders,
  buildScannerV2RefreshSeed,
  commitScannerV2CrawlVersion,
  createScannerV2RefreshJob,
  createScannerV2RefreshProcessor,
  FileScannerV2VersionStore,
} from "./scanner-v2-refresh.ts";
import {
  createScannerV2Job,
  FileScannerV2JobStore,
  runScannerV2WorkerBatch,
} from "./scanner-v2-worker.ts";
import {
  stableChunkId,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import type {
  CorpusChunk,
  CrawlPage,
  CrawlUrlDisposition,
  SafeHttpResponse,
} from "./types.ts";

function queued(url: string): CrawlUrlDisposition {
  return {
    url,
    status: "queued",
    discoveryReason: "sitemap",
  };
}

function discovered(url: string): CrawlUrlDisposition {
  return {
    url,
    status: "fetched",
    discoveryReason: "sitemap",
    canonicalUrl: url,
    fetchedAt: "2026-10-02T20:00:00.000Z",
  };
}

function pageFor(
  url: string,
  text: string,
  validators: { etag?: string; lastModified?: string } = {},
): { page: CrawlPage; chunks: CorpusChunk[] } {
  const contentHash = stableContentHash(text);
  const page: CrawlPage = {
    requestedUrl: url,
    canonicalUrl: url,
    title: "Page",
    headings: ["Page"],
    visibleText: text,
    structuredFacts: {},
    contentType: "text/html",
    fetchMode: "http",
    contentHash,
    fetchedAt: "2026-10-02T20:00:00.000Z",
    ...validators,
  };
  return {
    page,
    chunks: [
      {
        id: stableChunkId(url, 0, text),
        canonicalUrl: url,
        title: "Page",
        headingPath: ["Page"],
        text,
        ordinal: 0,
        contentHash,
      },
    ],
  };
}

function htmlResponse(
  url: string,
  body: string,
  headers: Record<string, string> = {},
): SafeHttpResponse {
  return {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...headers,
    },
    body,
    url: new URL(url),
  };
}

async function tempStores(): Promise<{
  root: string;
  jobs: FileScannerV2JobStore;
  versions: FileScannerV2VersionStore;
}> {
  const root = await mkdtemp(join(tmpdir(), "scanner-v2-stage10-"));
  return {
    root,
    jobs: new FileScannerV2JobStore(join(root, "jobs")),
    versions: new FileScannerV2VersionStore(join(root, "versions")),
  };
}

async function seedCompleteCrawl(input: {
  store: FileScannerV2JobStore;
  crawlId: string;
  pages: Array<{
    url: string;
    text: string;
    etag?: string;
    lastModified?: string;
  }>;
}): Promise<void> {
  await createScannerV2Job({
    store: input.store,
    crawlId: input.crawlId,
    origin: "https://acme.example",
    releaseSha: "sha-previous",
    urls: input.pages.map((item) => queued(item.url)),
    createdAt: "2026-10-02T20:00:00.000Z",
  });

  const byUrl = new Map(input.pages.map((item) => [item.url, item]));
  const result = await runScannerV2WorkerBatch({
    store: input.store,
    crawlId: input.crawlId,
    workerId: "seed-worker",
    batchSize: 64,
    now: () => new Date("2026-10-02T20:01:00.000Z"),
    processUrl: async ({ url }) => {
      const fixture = byUrl.get(url.url);
      assert.ok(fixture);
      return {
        disposition: "fetched",
        ...pageFor(url.url, fixture.text, {
          ...(fixture.etag ? { etag: fixture.etag } : {}),
          ...(fixture.lastModified
            ? { lastModified: fixture.lastModified }
            : {}),
        }),
      };
    },
  });
  assert.equal(result.state, "COMPLETE");
}

test("conditional headers use both stored HTTP validators when present", () => {
  const { page } = pageFor("https://acme.example/a", "old", {
    etag: '"abc"',
    lastModified: "Thu, 01 Oct 2026 12:00:00 GMT",
  });
  assert.deepEqual(buildScannerV2ConditionalHeaders(page), {
    "If-None-Match": '"abc"',
    "If-Modified-Since": "Thu, 01 Oct 2026 12:00:00 GMT",
  });
  assert.deepEqual(buildScannerV2ConditionalHeaders(undefined), {});
});

test("refresh seed requeues current fetched rows and prior fetched pages missing from discovery", () => {
  const seed = buildScannerV2RefreshSeed({
    currentUrls: [
      discovered("https://acme.example/current"),
      {
        url: "https://acme.example/blocked",
        status: "robots_skipped",
        discoveryReason: "sitemap",
        reason: "robots_disallow",
      },
    ],
    previousUrls: [
      {
        ...discovered("https://acme.example/current"),
        contentHash: "old",
      },
      discovered("https://acme.example/gone"),
    ],
  });

  assert.equal(seed.inheritedForConfirmation, 1);
  assert.equal(
    seed.urls.find((row) => row.url.endsWith("/current"))?.status,
    "queued",
  );
  assert.equal(
    seed.urls.find((row) => row.url.endsWith("/gone"))?.reason,
    "refresh_confirm_absent",
  );
  assert.equal(
    seed.urls.find((row) => row.url.endsWith("/blocked"))?.status,
    "robots_skipped",
  );
});

test("304 refresh reuses exact prior chunks and active corpus changes only after commit", async () => {
  const { jobs, versions } = await tempStores();
  const url = "https://acme.example/services";
  await seedCompleteCrawl({
    store: jobs,
    crawlId: "v1",
    pages: [
      {
        url,
        text: "Original service knowledge",
        etag: '"v1"',
        lastModified: "Thu, 01 Oct 2026 12:00:00 GMT",
      },
    ],
  });
  await commitScannerV2CrawlVersion({
    jobStore: jobs,
    versionStore: versions,
    crawlId: "v1",
    expectedPreviousCrawlId: null,
    committedAt: "2026-10-02T20:02:00.000Z",
  });

  const previousChunks = await jobs.listChunks("v1");
  const { seed } = await createScannerV2RefreshJob({
    store: jobs,
    previousCrawlId: "v1",
    crawlId: "v2",
    origin: "https://acme.example",
    releaseSha: "sha-refresh",
    currentUrls: [discovered(url)],
  });
  assert.equal(seed.inheritedForConfirmation, 0);
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v1");

  let bodyBytes = 0;
  let seenHeaders: Record<string, string> | undefined;
  const processUrl = await createScannerV2RefreshProcessor({
    store: jobs,
    previousCrawlId: "v1",
    options: {
      lookup: async () => ["203.0.113.10"],
      get: async (requestUrl, _ip, options) => {
        seenHeaders = options.headers;
        const body = "";
        bodyBytes += Buffer.byteLength(body);
        return {
          status: 304,
          headers: { etag: '"v1"' },
          body,
          url: requestUrl,
        };
      },
    },
  });

  const result = await runScannerV2WorkerBatch({
    store: jobs,
    crawlId: "v2",
    workerId: "refresh-worker",
    processUrl,
    now: () => new Date("2026-10-02T20:03:00.000Z"),
  });

  assert.equal(result.state, "COMPLETE");
  assert.equal(bodyBytes, 0);
  assert.deepEqual(seenHeaders, {
    "If-None-Match": '"v1"',
    "If-Modified-Since": "Thu, 01 Oct 2026 12:00:00 GMT",
  });
  assert.deepEqual(await jobs.listChunks("v2"), previousChunks);
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v1");

  await commitScannerV2CrawlVersion({
    jobStore: jobs,
    versionStore: versions,
    crawlId: "v2",
    expectedPreviousCrawlId: "v1",
    committedAt: "2026-10-02T20:04:00.000Z",
  });
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v2");
  assert.equal((await jobs.listPages("v1"))[0]?.visibleText, "Original service knowledge");
});

test("one changed page re-extracts only its chunks while unchanged page keeps stable chunk ids", async () => {
  const { jobs } = await tempStores();
  const a = "https://acme.example/a";
  const b = "https://acme.example/b";
  await seedCompleteCrawl({
    store: jobs,
    crawlId: "v1",
    pages: [
      { url: a, text: "Alpha old", etag: '"a1"' },
      { url: b, text: "Bravo stable", etag: '"b1"' },
    ],
  });
  const priorChunks = await jobs.listChunks("v1");

  await createScannerV2RefreshJob({
    store: jobs,
    previousCrawlId: "v1",
    crawlId: "v2",
    origin: "https://acme.example",
    releaseSha: "sha-refresh",
    currentUrls: [discovered(a), discovered(b)],
  });

  const processUrl = await createScannerV2RefreshProcessor({
    store: jobs,
    previousCrawlId: "v1",
    options: {
      lookup: async () => ["203.0.113.10"],
      get: async (requestUrl) => {
        if (requestUrl.pathname === "/b") {
          return {
            status: 304,
            headers: { etag: '"b1"' },
            body: "",
            url: requestUrl,
          };
        }
        return htmlResponse(
          requestUrl.toString(),
          "<html><head><title>A</title></head><body><h1>A</h1><p>Alpha changed fact</p></body></html>",
          { etag: '"a2"' },
        );
      },
    },
  });

  const result = await runScannerV2WorkerBatch({
    store: jobs,
    crawlId: "v2",
    workerId: "refresh-worker",
    processUrl,
    batchSize: 8,
  });
  assert.equal(result.state, "COMPLETE");

  const nextChunks = await jobs.listChunks("v2");
  const priorA = priorChunks.filter((chunk) => chunk.canonicalUrl === a);
  const priorB = priorChunks.filter((chunk) => chunk.canonicalUrl === b);
  const nextA = nextChunks.filter((chunk) => chunk.canonicalUrl === a);
  const nextB = nextChunks.filter((chunk) => chunk.canonicalUrl === b);

  assert.notDeepEqual(nextA.map((chunk) => chunk.id), priorA.map((chunk) => chunk.id));
  assert.deepEqual(nextB.map((chunk) => chunk.id), priorB.map((chunk) => chunk.id));
  assert.match((await jobs.listPages("v2")).find((page) => page.canonicalUrl === a)?.visibleText ?? "", /Alpha changed fact/);
});

test("confirmed 410 tombstones a removed page only in the new crawl", async () => {
  const { jobs, versions } = await tempStores();
  const keep = "https://acme.example/keep";
  const gone = "https://acme.example/gone";
  await seedCompleteCrawl({
    store: jobs,
    crawlId: "v1",
    pages: [
      { url: keep, text: "Keep this", etag: '"keep"' },
      { url: gone, text: "Old deleted knowledge", etag: '"gone"' },
    ],
  });
  await commitScannerV2CrawlVersion({
    jobStore: jobs,
    versionStore: versions,
    crawlId: "v1",
    expectedPreviousCrawlId: null,
  });

  const created = await createScannerV2RefreshJob({
    store: jobs,
    previousCrawlId: "v1",
    crawlId: "v2",
    origin: "https://acme.example",
    releaseSha: "sha-refresh",
    currentUrls: [discovered(keep)],
  });
  assert.equal(created.seed.inheritedForConfirmation, 1);

  const processUrl = await createScannerV2RefreshProcessor({
    store: jobs,
    previousCrawlId: "v1",
    options: {
      lookup: async () => ["203.0.113.10"],
      get: async (requestUrl) =>
        requestUrl.pathname === "/gone"
          ? {
              status: 410,
              headers: { "content-type": "text/html" },
              body: "",
              url: requestUrl,
            }
          : {
              status: 304,
              headers: { etag: '"keep"' },
              body: "",
              url: requestUrl,
            },
    },
  });

  const result = await runScannerV2WorkerBatch({
    store: jobs,
    crawlId: "v2",
    workerId: "refresh-worker",
    processUrl,
    batchSize: 8,
  });
  assert.equal(result.state, "COMPLETE");
  assert.equal(
    (await jobs.getUrl("v2", gone))?.reason,
    "tombstone_http_410",
  );
  assert.equal(
    (await jobs.listPages("v2")).some((page) => page.canonicalUrl === gone),
    false,
  );
  assert.equal(
    (await jobs.listChunks("v2")).some((chunk) => chunk.canonicalUrl === gone),
    false,
  );

  // Old active corpus still contains the page until the new version commits.
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v1");
  assert.equal(
    (await jobs.listPages("v1")).some((page) => page.canonicalUrl === gone),
    true,
  );

  await commitScannerV2CrawlVersion({
    jobStore: jobs,
    versionStore: versions,
    crawlId: "v2",
    expectedPreviousCrawlId: "v1",
  });
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v2");
});

test("partial refresh cannot replace active corpus and stale compare-and-swap cannot overwrite newer version", async () => {
  const { jobs, versions } = await tempStores();
  const url = "https://acme.example/a";
  await seedCompleteCrawl({
    store: jobs,
    crawlId: "v1",
    pages: [{ url, text: "v1", etag: '"v1"' }],
  });
  await commitScannerV2CrawlVersion({
    jobStore: jobs,
    versionStore: versions,
    crawlId: "v1",
    expectedPreviousCrawlId: null,
  });

  await createScannerV2Job({
    store: jobs,
    crawlId: "partial",
    origin: "https://acme.example",
    releaseSha: "sha-partial",
    retryLimit: 1,
    urls: [queued(url)],
  });
  const partial = await runScannerV2WorkerBatch({
    store: jobs,
    crawlId: "partial",
    workerId: "bad-worker",
    processUrl: async () => {
      throw new Error("network failure");
    },
  });
  assert.equal(partial.state, "PARTIAL");

  await assert.rejects(
    () =>
      commitScannerV2CrawlVersion({
        jobStore: jobs,
        versionStore: versions,
        crawlId: "partial",
        expectedPreviousCrawlId: "v1",
      }),
    /commit_requires_complete/,
  );
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v1");

  await seedCompleteCrawl({
    store: jobs,
    crawlId: "v2",
    pages: [{ url, text: "v2", etag: '"v2"' }],
  });
  await commitScannerV2CrawlVersion({
    jobStore: jobs,
    versionStore: versions,
    crawlId: "v2",
    expectedPreviousCrawlId: "v1",
  });

  await seedCompleteCrawl({
    store: jobs,
    crawlId: "stale",
    pages: [{ url, text: "stale", etag: '"stale"' }],
  });
  await assert.rejects(
    () =>
      commitScannerV2CrawlVersion({
        jobStore: jobs,
        versionStore: versions,
        crawlId: "stale",
        expectedPreviousCrawlId: "v1",
      }),
    /commit_conflict/,
  );
  assert.equal((await versions.getActive("https://acme.example"))?.crawlId, "v2");
});
