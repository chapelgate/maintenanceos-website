import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { stableContentHash } from "./scanner-v2-foundation.ts";
import {
  recoverScannerV2ReaderPage,
  runPersistentScannerV2,
} from "./scanner-v2-runtime.ts";
import type {
  CrawlManifest,
  CrawlPage,
  CrawlUrlDisposition,
} from "./types.ts";

function page(url: string, text: string): CrawlPage {
  return {
    requestedUrl: url,
    canonicalUrl: url,
    title: text,
    headings: [text],
    visibleText: text,
    structuredFacts: {
      businessName: "Acme Gates",
      services: ["Heritage alley gate installation"],
    },
    contentType: "text/html",
    fetchMode: "http",
    contentHash: stableContentHash(text),
    fetchedAt: "2026-10-04T12:00:00.000Z",
  };
}

function seedManifest(origin: string): CrawlManifest {
  const urls: CrawlUrlDisposition[] = [
    {
      url: origin + "/",
      status: "queued",
      discoveryReason: "submitted",
    },
    {
      url: origin + "/deep",
      status: "queued",
      discoveryReason: "html_link",
      discoveredFrom: origin + "/",
    },
  ];
  return {
    crawlId: "seed",
    origin,
    state: "PARTIAL",
    discovered: 2,
    queued: 2,
    fetched: 0,
    duplicate: 0,
    policySkipped: 0,
    robotsSkipped: 0,
    unresolved: 0,
    urls,
  };
}

test("reader recovery keeps the original public target as provenance", async () => {
  let calls = 0;
  const target = "https://forum.example/about";
  const recovered = await recoverScannerV2ReaderPage(target, {
    lookup: async (hostname) => {
      assert.equal(hostname, "r.jina.ai");
      return ["203.0.113.20"];
    },
    get: async (url) => {
      calls += 1;
      assert.equal(url.hostname, "r.jina.ai");
      assert.match(url.pathname, /https:\/\/forum\.example\/about/);
      return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html><body><h1>Forum Housing</h1><p>Recovered public page.</p></body></html>",
        url,
      };
    },
  });

  assert.equal(calls, 1);
  assert.ok(recovered);
  assert.equal(recovered?.url.toString(), target);
  assert.equal(recovered?.headers["content-type"], "text/html; charset=utf-8");
  assert.match(recovered?.body ?? "", /Recovered public page/);
});

test("persistent runtime resumes the same crawl identity from disk", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-runtime-"));
  let discoveryCalls = 0;
  try {
    const discover = async (rawUrl: string) => {
      discoveryCalls += 1;
      const origin = new URL(rawUrl).origin;
      return {
        manifest: seedManifest(origin),
        sitemapSources: [],
        pageSources: [],
        sitemapDocuments: 0,
        sitemapUrlsDiscovered: 0,
        htmlPagesFetched: 0,
        htmlLinksDiscovered: 0,
        urlsDroppedByLimit: 0,
        warnings: [],
        limitReached: false,
        incomplete: true,
      };
    };

    const processUrl = async ({ url }: { url: CrawlUrlDisposition }) => {
      const p = page(url.url, url.url.endsWith("/deep")
        ? "Heritage installations take six weeks after survey."
        : "Acme Gates");
      return {
        disposition: "fetched" as const,
        canonicalUrl: p.canonicalUrl,
        page: p,
        chunks: [{
          id: stableContentHash(url.url),
          canonicalUrl: url.url,
          title: p.title,
          headingPath: p.headings,
          text: p.visibleText,
          ordinal: 0,
          contentHash: p.contentHash,
        }],
      };
    };

    const firstTimes = [0, 500, 2_000];
    const first = await runPersistentScannerV2("https://acme.example/", {
      stateRoot: root,
      releaseSha: "release-a",
      batchSize: 1,
      requestMs: 1_000,
      now: () => firstTimes.shift() ?? 2_000,
      discover: discover as never,
      processUrl: processUrl as never,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.scannerV2?.state, "CRAWLING");
    assert.equal(first.scannerV2?.fetched, 1);
    assert.equal(first.scannerV2?.resumed, false);

    const secondTimes = [0, 500, 500];
    const second = await runPersistentScannerV2("https://acme.example/", {
      stateRoot: root,
      releaseSha: "release-a",
      batchSize: 8,
      requestMs: 1_000,
      now: () => secondTimes.shift() ?? 500,
      discover: discover as never,
      processUrl: processUrl as never,
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.scannerV2?.state, "COMPLETE");
    assert.equal(second.scannerV2?.fetched, 2);
    assert.equal(second.scannerV2?.resumed, true);
    assert.equal(discoveryCalls, 1);
    assert.ok(
      second.knowledge?.some((item) => /six weeks/i.test(item.text)),
    );
    assert.equal(second.draft.businessName, "Acme Gates");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("release SHA creates a fresh durable crawl identity", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-release-"));
  let discoveryCalls = 0;
  try {
    const discover = async (rawUrl: string) => {
      discoveryCalls += 1;
      const origin = new URL(rawUrl).origin;
      return {
        manifest: {
          ...seedManifest(origin),
          urls: [seedManifest(origin).urls[0]!],
          discovered: 1,
          queued: 1,
        },
        sitemapSources: [],
        pageSources: [],
        sitemapDocuments: 0,
        sitemapUrlsDiscovered: 0,
        htmlPagesFetched: 0,
        htmlLinksDiscovered: 0,
        urlsDroppedByLimit: 0,
        warnings: [],
        limitReached: false,
        incomplete: true,
      };
    };
    const processUrl = async ({ url }: { url: CrawlUrlDisposition }) => {
      const p = page(url.url, "Acme Gates");
      return {
        disposition: "fetched" as const,
        page: p,
        chunks: [],
      };
    };

    await runPersistentScannerV2("https://acme.example/", {
      stateRoot: root,
      releaseSha: "release-a",
      discover: discover as never,
      processUrl: processUrl as never,
    });
    await runPersistentScannerV2("https://acme.example/", {
      stateRoot: root,
      releaseSha: "release-b",
      discover: discover as never,
      processUrl: processUrl as never,
    });

    assert.equal(discoveryCalls, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
