import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCrawlManifest,
  InMemoryScannerV2Store,
  isScannerV2Enabled,
  stableChunkId,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import type {
  CorpusChunk,
  CrawlPage,
  CrawlUrlDisposition,
} from "./types.ts";

test("Scanner V2 feature flag is default-off and explicit opt-in only", () => {
  assert.equal(isScannerV2Enabled({}), false);
  assert.equal(isScannerV2Enabled({ ONBOARDING_SCANNER_V2: "false" }), false);
  assert.equal(isScannerV2Enabled({ ONBOARDING_SCANNER_V2: "0" }), false);
  assert.equal(isScannerV2Enabled({ ONBOARDING_SCANNER_V2: "TRUE" }), false);
  assert.equal(isScannerV2Enabled({ ONBOARDING_SCANNER_V2: "true" }), true);
  assert.equal(isScannerV2Enabled({ ONBOARDING_SCANNER_V2: "1" }), true);
});

test("content and chunk hashes are deterministic and crawl-independent", () => {
  const linux = "Heading\nBody text\n";
  const windows = "Heading\r\nBody text\r\n";

  assert.equal(stableContentHash(linux), stableContentHash(windows));
  assert.notEqual(stableContentHash(linux), stableContentHash("Heading\nDifferent\n"));

  const a = stableChunkId("https://example.com/service", 0, linux);
  const b = stableChunkId("https://example.com/service", 0, windows);
  assert.equal(a, b);
  assert.notEqual(
    a,
    stableChunkId("https://example.com/other", 0, linux),
  );
  assert.notEqual(
    a,
    stableChunkId("https://example.com/service", 1, linux),
  );
});

test("COMPLETE is downgraded to PARTIAL when any URL is queued or unresolved", () => {
  const urls: CrawlUrlDisposition[] = [
    {
      url: "https://example.com/",
      canonicalUrl: "https://example.com/",
      status: "fetched",
      discoveryReason: "submitted",
    },
    {
      url: "https://example.com/about",
      status: "queued",
      discoveryReason: "html_link",
      discoveredFrom: "https://example.com/",
    },
    {
      url: "https://example.com/contact",
      status: "unresolved",
      discoveryReason: "sitemap",
      reason: "fetch_failed",
    },
  ];

  const manifest = buildCrawlManifest({
    crawlId: "crawl-1",
    origin: "https://example.com",
    requestedState: "COMPLETE",
    urls,
  });

  assert.equal(manifest.state, "PARTIAL");
  assert.equal(manifest.discovered, 3);
  assert.equal(manifest.fetched, 1);
  assert.equal(manifest.queued, 1);
  assert.equal(manifest.unresolved, 1);
});

test("COMPLETE is allowed only after every discovered URL has a terminal disposition", () => {
  const manifest = buildCrawlManifest({
    crawlId: "crawl-2",
    origin: "https://example.com",
    requestedState: "COMPLETE",
    urls: [
      {
        url: "https://example.com/",
        canonicalUrl: "https://example.com/",
        status: "fetched",
        discoveryReason: "submitted",
      },
      {
        url: "https://example.com/?utm_source=test",
        canonicalUrl: "https://example.com/",
        status: "duplicate",
        discoveryReason: "html_link",
      },
      {
        url: "https://example.com/private",
        status: "robots_skipped",
        discoveryReason: "sitemap",
        reason: "robots_disallow",
      },
      {
        url: "https://example.com/checkout",
        status: "policy_skipped",
        discoveryReason: "html_link",
        reason: "mutation_surface",
      },
    ],
  });

  assert.equal(manifest.state, "COMPLETE");
  assert.equal(manifest.discovered, 4);
  assert.equal(manifest.fetched, 1);
  assert.equal(manifest.duplicate, 1);
  assert.equal(manifest.robotsSkipped, 1);
  assert.equal(manifest.policySkipped, 1);
  assert.equal(manifest.queued, 0);
  assert.equal(manifest.unresolved, 0);
  assert.deepEqual(
    manifest.urls.map((item) => item.url),
    [...manifest.urls.map((item) => item.url)].sort(),
  );
});

test("in-memory foundation store keeps corpus and frontier isolated per crawl", async () => {
  const store = new InMemoryScannerV2Store();
  const text = "Boiler servicing is available across Wirral.";
  const page: CrawlPage = {
    requestedUrl: "https://example.com/services",
    canonicalUrl: "https://example.com/services",
    title: "Services",
    headings: ["Services", "Boiler servicing"],
    visibleText: text,
    structuredFacts: { services: ["Boiler servicing"] },
    contentType: "text/html",
    fetchMode: "http",
    contentHash: stableContentHash(text),
    fetchedAt: "2026-10-02T12:00:00.000Z",
  };
  const chunk: CorpusChunk = {
    id: stableChunkId(page.canonicalUrl, 0, text),
    canonicalUrl: page.canonicalUrl,
    title: page.title,
    headingPath: ["Services", "Boiler servicing"],
    text,
    ordinal: 0,
    contentHash: stableContentHash(text),
  };

  await store.putPage("crawl-a", page);
  await store.putChunks("crawl-a", [chunk]);
  await store.upsertUrl("crawl-a", {
    url: page.requestedUrl,
    canonicalUrl: page.canonicalUrl,
    status: "fetched",
    discoveryReason: "sitemap",
    contentHash: page.contentHash,
    fetchedAt: page.fetchedAt,
  });
  await store.upsertUrl("crawl-b", {
    url: "https://other.example/",
    status: "queued",
    discoveryReason: "submitted",
  });

  assert.deepEqual(await store.listPages("crawl-a"), [page]);
  assert.deepEqual(await store.listChunks("crawl-a"), [chunk]);
  assert.equal((await store.listUrls("crawl-a")).length, 1);
  assert.equal((await store.listUrls("crawl-b")).length, 1);
  assert.equal((await store.listPages("crawl-b")).length, 0);

  const copy = await store.getPage("crawl-a", page.canonicalUrl);
  assert.ok(copy);
  copy.visibleText = "mutated outside the store";
  assert.equal(
    (await store.getPage("crawl-a", page.canonicalUrl))?.visibleText,
    text,
  );
});

test("in-memory lease store rejects a competing live lease and allows expiry/release", async () => {
  const store = new InMemoryScannerV2Store();
  const first = {
    crawlId: "crawl-a",
    leaseKey: "https://example.com/page",
    owner: "worker-a",
    expiresAt: "2026-10-02T12:05:00.000Z",
  };

  assert.equal(
    await store.acquireLease(first, "2026-10-02T12:00:00.000Z"),
    true,
  );
  assert.equal(
    await store.acquireLease(
      { ...first, owner: "worker-b" },
      "2026-10-02T12:01:00.000Z",
    ),
    false,
  );
  assert.equal(
    await store.acquireLease(
      {
        ...first,
        owner: "worker-b",
        expiresAt: "2026-10-02T12:10:00.000Z",
      },
      "2026-10-02T12:06:00.000Z",
    ),
    true,
  );
  assert.equal(
    await store.releaseLease(
      first.crawlId,
      first.leaseKey,
      "worker-a",
    ),
    false,
  );
  assert.equal(
    await store.releaseLease(
      first.crawlId,
      first.leaseKey,
      "worker-b",
    ),
    true,
  );
  assert.equal(
    await store.getLease(first.crawlId, first.leaseKey),
    undefined,
  );
});
