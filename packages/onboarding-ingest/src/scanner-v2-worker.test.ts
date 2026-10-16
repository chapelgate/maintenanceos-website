import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createScannerV2Job,
  FileScannerV2JobStore,
  frontierUrlsToSkip,
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
} from "./types.ts";

function queued(url: string): CrawlUrlDisposition {
  return {
    url,
    status: "queued",
    discoveryReason: "sitemap",
  };
}

function pageFor(url: string, text: string): {
  page: CrawlPage;
  chunks: CorpusChunk[];
} {
  const contentHash = stableContentHash(text);
  const page: CrawlPage = {
    requestedUrl: url,
    canonicalUrl: url,
    title: new URL(url).pathname,
    headings: [],
    visibleText: text,
    structuredFacts: {},
    contentType: "text/html",
    fetchMode: "http",
    contentHash,
    fetchedAt: "2026-10-02T20:00:00.000Z",
  };
  return {
    page,
    chunks: [
      {
        id: stableChunkId(url, 0, text),
        canonicalUrl: url,
        headingPath: [],
        text,
        ordinal: 0,
        contentHash,
      },
    ],
  };
}

async function tempStore(): Promise<{
  root: string;
  store: FileScannerV2JobStore;
}> {
  const root = await mkdtemp(join(tmpdir(), "scanner-v2-stage9-"));
  return { root, store: new FileScannerV2JobStore(root) };
}

test("file-backed job survives store recreation and resumes to the same manifest", async () => {
  const { root, store } = await tempStore();
  const urls = [
    queued("https://acme.example/a"),
    queued("https://acme.example/b"),
    queued("https://acme.example/c"),
  ];

  await createScannerV2Job({
    store,
    crawlId: "resume",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    urls,
    createdAt: "2026-10-02T20:00:00.000Z",
  });

  const processUrl = async ({ url }: { url: CrawlUrlDisposition }) => ({
    disposition: "fetched" as const,
    ...pageFor(url.url, "content for " + url.url),
  });

  const first = await runScannerV2WorkerBatch({
    store,
    crawlId: "resume",
    workerId: "worker-a",
    processUrl,
    batchSize: 1,
    now: () => new Date("2026-10-02T20:01:00.000Z"),
  });
  assert.equal(first.attempted, 1);
  assert.equal(first.hasMoreWork, true);
  assert.equal(first.nextAction, "schedule_next_batch");

  // Simulate process restart: new store object, same durable root.
  const restarted = new FileScannerV2JobStore(root);
  const second = await runScannerV2WorkerBatch({
    store: restarted,
    crawlId: "resume",
    workerId: "worker-b",
    processUrl,
    batchSize: 8,
    now: () => new Date("2026-10-02T20:02:00.000Z"),
  });

  assert.equal(second.state, "COMPLETE");
  assert.equal(second.hasMoreWork, false);
  assert.equal(second.manifest.fetched, 3);
  assert.equal(second.manifest.queued, 0);
  assert.equal((await restarted.listPages("resume")).length, 3);
  assert.equal((await restarted.listChunks("resume")).length, 3);
});

test("terminal frontier with no fetched evidence stays PARTIAL", async () => {
  const { store } = await tempStore();
  await createScannerV2Job({
    store,
    crawlId: "empty-terminal",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    urls: [
      {
        url: "https://acme.example/",
        status: "policy_skipped",
        discoveryReason: "submitted",
        reason: "http_401",
      },
    ],
  });

  const result = await runScannerV2WorkerBatch({
    store,
    crawlId: "empty-terminal",
    workerId: "worker-a",
    processUrl: async () => {
      throw new Error("must_not_run");
    },
  });

  assert.equal(result.attempted, 0);
  assert.equal(result.state, "PARTIAL");
  assert.equal(result.manifest.state, "PARTIAL");
  assert.equal(result.manifest.fetched, 0);
  assert.equal(result.hasMoreWork, false);
});

test("a large non-key frontier is capped once the home page is fetched", async () => {
  const { store } = await tempStore();
  const blogs = Array.from({ length: 20 }, (_, index) =>
    queued(`https://acme.example/blog/post-${index}`),
  );
  await createScannerV2Job({
    store,
    crawlId: "cap",
    origin: "https://acme.example",
    releaseSha: "sha-frontier",
    urls: [
      {
        url: "https://acme.example/",
        status: "fetched",
        discoveryReason: "submitted",
      },
      ...blogs,
    ],
  });

  const before = await store.listUrls("cap");
  assert.equal(frontierUrlsToSkip(before).length, 16);

  const result = await runScannerV2WorkerBatch({
    store,
    crawlId: "cap",
    workerId: "worker-a",
    batchSize: 1,
    processUrl: async ({ url }) => ({
      disposition: "fetched" as const,
      ...pageFor(url.url, "body"),
    }),
  });

  const rows = await store.listUrls("cap");
  assert.equal(rows.filter((row) => row.reason === "frontier_capped").length, 16);
  assert.equal(result.attempted, 1);
  assert.equal(result.hasMoreWork, true);
  assert.equal(rows.filter((row) => row.status === "queued").length, 3);
});

test("duplicate worker execution is idempotent by terminal URL state and stable chunk id", async () => {
  const { store } = await tempStore();
  const url = "https://acme.example/a";
  await createScannerV2Job({
    store,
    crawlId: "idem",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    urls: [queued(url)],
  });

  let calls = 0;
  const processUrl = async ({ url: row }: { url: CrawlUrlDisposition }) => {
    calls += 1;
    return {
      disposition: "fetched" as const,
      ...pageFor(row.url, "same content"),
    };
  };

  const first = await runScannerV2WorkerBatch({
    store,
    crawlId: "idem",
    workerId: "worker-a",
    processUrl,
  });
  const second = await runScannerV2WorkerBatch({
    store,
    crawlId: "idem",
    workerId: "worker-b",
    processUrl,
  });

  assert.equal(first.state, "COMPLETE");
  assert.equal(second.attempted, 0);
  assert.equal(calls, 1);
  assert.equal((await store.listPages("idem")).length, 1);
  assert.equal((await store.listChunks("idem")).length, 1);
});

test("expired lease is reclaimable after a worker disappears", async () => {
  const { root, store } = await tempStore();
  const url = "https://acme.example/a";
  await createScannerV2Job({
    store,
    crawlId: "lease",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    urls: [queued(url)],
  });

  assert.equal(
    await store.acquireLease(
      {
        crawlId: "lease",
        leaseKey: url,
        owner: "dead-worker",
        expiresAt: "2026-10-02T20:00:10.000Z",
      },
      "2026-10-02T20:00:00.000Z",
    ),
    true,
  );

  const beforeExpiry = await runScannerV2WorkerBatch({
    store,
    crawlId: "lease",
    workerId: "new-worker",
    processUrl: async ({ url: row }) => ({
      disposition: "fetched",
      ...pageFor(row.url, "recovered"),
    }),
    now: () => new Date("2026-10-02T20:00:05.000Z"),
  });
  assert.equal(beforeExpiry.attempted, 0);
  assert.equal(beforeExpiry.deferred, 1);
  assert.equal(beforeExpiry.hasMoreWork, true);

  const restarted = new FileScannerV2JobStore(root);
  const afterExpiry = await runScannerV2WorkerBatch({
    store: restarted,
    crawlId: "lease",
    workerId: "new-worker",
    processUrl: async ({ url: row }) => ({
      disposition: "fetched",
      ...pageFor(row.url, "recovered"),
    }),
    now: () => new Date("2026-10-02T20:00:20.000Z"),
  });
  assert.equal(afterExpiry.state, "COMPLETE");
  assert.equal(afterExpiry.manifest.fetched, 1);
});

test("one poisoned URL exhausts retries without blocking healthy work", async () => {
  const { store } = await tempStore();
  await createScannerV2Job({
    store,
    crawlId: "poison",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    retryLimit: 2,
    urls: [
      queued("https://acme.example/poison"),
      queued("https://acme.example/healthy"),
    ],
  });

  const processUrl = async ({ url }: { url: CrawlUrlDisposition }) => {
    if (url.url.endsWith("/poison")) {
      throw new Error("synthetic poisoned page");
    }
    return {
      disposition: "fetched" as const,
      ...pageFor(url.url, "healthy content"),
    };
  };

  const first = await runScannerV2WorkerBatch({
    store,
    crawlId: "poison",
    workerId: "worker-a",
    processUrl,
    batchSize: 8,
    now: () => new Date("2026-10-02T20:01:00.000Z"),
  });
  assert.equal(first.manifest.fetched, 1);
  assert.equal(first.manifest.queued, 1);
  assert.equal(first.failed, 1);
  assert.equal(first.state, "CRAWLING");

  const second = await runScannerV2WorkerBatch({
    store,
    crawlId: "poison",
    workerId: "worker-b",
    processUrl,
    batchSize: 8,
    now: () => new Date("2026-10-02T20:02:00.000Z"),
  });
  assert.equal(second.state, "PARTIAL");
  assert.equal(second.manifest.fetched, 1);
  assert.equal(second.manifest.unresolved, 1);
  assert.equal(second.manifest.queued, 0);

  const poison = await store.getUrl(
    "poison",
    "https://acme.example/poison",
  );
  assert.equal(poison?.retryCount, 2);
  assert.match(poison?.reason ?? "", /^retry_exhausted:/);
});

test("content-hash duplicate collapses to the first canonical page and stores no duplicate chunks", async () => {
  const { store } = await tempStore();
  const firstUrl = "https://acme.example/a";
  const secondUrl = "https://acme.example/a-copy";

  await createScannerV2Job({
    store,
    crawlId: "duplicate",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    urls: [queued(firstUrl), queued(secondUrl)],
  });

  const result = await runScannerV2WorkerBatch({
    store,
    crawlId: "duplicate",
    workerId: "worker-a",
    batchSize: 8,
    processUrl: async ({ url }) => ({
      disposition: "fetched",
      ...pageFor(url.url, "identical business content"),
    }),
  });

  assert.equal(result.state, "COMPLETE");
  assert.equal(result.manifest.fetched, 1);
  assert.equal(result.manifest.duplicate, 1);
  assert.equal((await store.listPages("duplicate")).length, 1);
  assert.equal((await store.listChunks("duplicate")).length, 1);

  const duplicate = await store.getUrl("duplicate", secondUrl);
  assert.equal(duplicate?.status, "duplicate");
  assert.equal(duplicate?.canonicalUrl, firstUrl);
  assert.equal(duplicate?.reason, "content_hash_duplicate");
});

test("job creation heals partial frontier seeding but rejects identity drift", async () => {
  const { store } = await tempStore();
  const seed = [
    queued("https://acme.example/a"),
    queued("https://acme.example/b"),
    queued("https://acme.example/c"),
  ];
  const first = await createScannerV2Job({
    store,
    crawlId: "same-job",
    origin: "https://acme.example",
    releaseSha: "sha-original",
    urls: [seed[0]!],
    createdAt: "2026-10-02T20:00:00.000Z",
  });

  // Simulate a crash after job.json and only the first frontier row existed.
  const resumed = await createScannerV2Job({
    store,
    crawlId: "same-job",
    origin: "https://acme.example",
    releaseSha: "sha-original",
    urls: seed,
    createdAt: "2026-10-02T21:00:00.000Z",
  });
  assert.deepEqual(resumed, first);
  assert.equal((await store.listUrls("same-job")).length, 3);

  await assert.rejects(
    () =>
      createScannerV2Job({
        store,
        crawlId: "same-job",
        origin: "https://evil.example",
        releaseSha: "sha-overwrite",
        urls: [queued("https://evil.example/")],
      }),
    /scanner_v2_job_identity_mismatch/,
  );
  assert.equal((await store.getJob("same-job"))?.releaseSha, "sha-original");
});

test("worker refuses to commit after its lease expires during processing", async () => {
  const { store } = await tempStore();
  const url = "https://acme.example/slow";
  await createScannerV2Job({
    store,
    crawlId: "fence",
    origin: "https://acme.example",
    releaseSha: "sha-stage9",
    urls: [queued(url)],
  });

  const times = [
    new Date("2026-10-02T20:00:00.000Z"),
    new Date("2026-10-02T20:00:02.500Z"),
    new Date("2026-10-02T20:00:03.000Z"),
  ];
  let index = 0;
  const result = await runScannerV2WorkerBatch({
    store,
    crawlId: "fence",
    workerId: "slow-worker",
    leaseMs: 1_000,
    processUrl: async ({ url: row }) => ({
      disposition: "fetched",
      ...pageFor(row.url, "slow result must not commit"),
    }),
    now: () => times[Math.min(index++, times.length - 1)]!,
  });

  assert.equal(result.completed, 0);
  assert.equal(result.deferred, 1);
  assert.equal(result.hasMoreWork, true);
  assert.equal((await store.listPages("fence")).length, 0);
  assert.equal((await store.listChunks("fence")).length, 0);
  assert.equal((await store.getUrl("fence", url))?.status, "queued");
});
