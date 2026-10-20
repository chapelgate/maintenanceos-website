import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { stableContentHash } from "./scanner-v2-foundation.ts";
import {
  aggregateFacts,
  documentCrawlDisposition,
  draftFromFacts,
  recoverScannerV2ReaderPage,
  runPersistentScannerV2,
} from "./scanner-v2-runtime.ts";
import { siteBlockedScan } from "./site-block.ts";
import { FileScannerV2JobStore } from "./scanner-v2-worker.ts";
import type {
  BusinessFactMeta,
  BusinessFacts,
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

test("priority pages are read before posts and the crawl uses the request budget", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-priority-"));
  const seen: string[] = [];
  try {
    const discover = async (rawUrl: string) => {
      const origin = new URL(rawUrl).origin;
      const urls: CrawlUrlDisposition[] = ["/", "/2024/boiler-tips", "/contact"].map((path) => ({
        url: origin + path,
        status: "queued",
        discoveryReason: "sitemap",
      }));
      return {
        manifest: {
          crawlId: "seed",
          origin,
          state: "PARTIAL" as const,
          discovered: urls.length,
          queued: urls.length,
          fetched: 0,
          duplicate: 0,
          policySkipped: 0,
          robotsSkipped: 0,
          unresolved: 0,
          urls,
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
    let clock = 0;
    const result = await runPersistentScannerV2("https://trade.example/", {
      stateRoot: root,
      releaseSha: "priority",
      requestMs: 40_000,
      batchSize: 1,
      now: () => (clock += 5),
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        seen.push(url.url);
        const fetched = page(url.url, `Trade page ${url.url}`);
        return {
          disposition: "fetched" as const,
          canonicalUrl: url.url,
          page: fetched,
          chunks: [],
        };
      }) as never,
    });
    assert.deepEqual(seen, [
      "https://trade.example/",
      "https://trade.example/contact",
      "https://trade.example/2024/boiler-tips",
    ]);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.scannerV2?.state, "COMPLETE");
    assert.equal(result.scannerV2?.fetched, 3);
    assert.equal(result.scannerV2?.discovered, 3);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function thinPage(url: string): CrawlPage {
  return {
    requestedUrl: url,
    canonicalUrl: url,
    title: "Challenge",
    headings: [],
    visibleText: "Challenge",
    structuredFacts: {},
    contentType: "text/html",
    fetchMode: "http",
    contentHash: stableContentHash(`thin:${url}`),
    fetchedAt: "2026-10-16T12:00:00.000Z",
  };
}

test("a thin home page queues contact, about, and services instead of finishing empty", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-thin-home-"));
  const seen: string[] = [];
  try {
    const discover = async (rawUrl: string) => {
      const origin = new URL(rawUrl).origin;
      const urls: CrawlUrlDisposition[] = [
        {
          url: `${origin}/`,
          status: "queued",
          discoveryReason: "submitted",
        },
      ];
      return {
        manifest: {
          crawlId: "seed",
          origin,
          state: "PARTIAL" as const,
          discovered: 1,
          queued: 1,
          fetched: 0,
          duplicate: 0,
          policySkipped: 0,
          robotsSkipped: 0,
          unresolved: 0,
          urls,
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
    let clock = 0;
    const result = await runPersistentScannerV2("https://wirralplumbers.example/", {
      stateRoot: root,
      releaseSha: "thin-home",
      requestMs: 40_000,
      batchSize: 4,
      now: () => (clock += 5),
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        seen.push(url.url);
        const fetched = url.url.endsWith("/contact")
          ? {
              ...thinPage(url.url),
              structuredFacts: {
                contact: { phones: ["0758 0395493"], emails: ["mike@wirralplumbers.com"] },
                address: "78 St Andrews Road, Bebington",
              },
            }
          : thinPage(url.url);
        return {
          disposition: "fetched" as const,
          canonicalUrl: url.url,
          page: fetched,
          chunks: [],
        };
      }) as never,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(seen.includes("https://wirralplumbers.example/contact"));
    assert.ok(seen.includes("https://wirralplumbers.example/about"));
    assert.ok(seen.includes("https://wirralplumbers.example/services"));
    assert.equal(result.scannerV2?.state, "COMPLETE");
    assert.ok((result.scannerV2?.fetched ?? 0) > 1);
    assert.deepEqual(result.facts?.contact?.phones, ["0758 0395493"]);
    assert.equal(result.facts?.address, "78 St Andrews Road, Bebington");
    assert.equal(result.warnings.includes("thin_home_page"), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("one fetched page with no contact facts is partial, not complete", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-empty-home-"));
  try {
    const discover = async (rawUrl: string) => {
      const origin = new URL(rawUrl).origin;
      return {
        manifest: {
          crawlId: "seed",
          origin,
          state: "PARTIAL" as const,
          discovered: 1,
          queued: 1,
          fetched: 0,
          duplicate: 0,
          policySkipped: 0,
          robotsSkipped: 0,
          unresolved: 0,
          urls: [
            {
              url: `${origin}/`,
              status: "queued" as const,
              discoveryReason: "submitted" as const,
            },
          ],
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
    let clock = 0;
    const result = await runPersistentScannerV2("https://wirralplumbers.example/", {
      stateRoot: root,
      releaseSha: "empty-home",
      requestMs: 40_000,
      batchSize: 4,
      now: () => (clock += 5),
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => ({
        disposition: "fetched" as const,
        canonicalUrl: url.url,
        page: thinPage(url.url),
        chunks: [],
      })) as never,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.notEqual(result.scannerV2?.state, "COMPLETE");
    assert.equal(result.scannerV2?.state, "PARTIAL");
    assert.ok((result.scannerV2?.fetched ?? 0) > 1);
    assert.ok(result.warnings.includes("thin_home_page"));
    assert.equal(result.facts?.contact, undefined);
    assert.equal(result.draft.businessName, "Unknown — not found");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

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

    const firstTimes = [0, 500, 500, 2_000];
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

test("a skipped search URL is not a visitor warning", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-search-"));
  try {
    const discover = async (rawUrl: string) => {
      const origin = new URL(rawUrl).origin;
      return {
        manifest: {
          crawlId: "seed",
          origin,
          state: "PARTIAL" as const,
          discovered: 2,
          queued: 1,
          fetched: 0,
          duplicate: 0,
          policySkipped: 1,
          robotsSkipped: 0,
          unresolved: 0,
          urls: [
            {
              url: `${origin}/`,
              status: "queued" as const,
              discoveryReason: "submitted" as const,
              retryCount: 0,
            },
            {
              url: `${origin}/search`,
              status: "policy_skipped" as const,
              reason: "search_endpoint",
              discoveryReason: "html_link" as const,
              retryCount: 0,
            },
          ],
        },
        sitemapSources: [],
        pageSources: [],
        sitemapDocuments: 0,
        sitemapUrlsDiscovered: 0,
        htmlPagesFetched: 0,
        htmlLinksDiscovered: 0,
        urlsDroppedByLimit: 0,
        warnings: ["search_endpoint"],
        limitReached: false,
        incomplete: false,
      };
    };
    const processUrl = async ({ url }: { url: CrawlUrlDisposition }) => {
      const p = page(url.url, "Propeller Properties");
      return {
        disposition: "fetched" as const,
        canonicalUrl: p.canonicalUrl,
        page: p,
        chunks: [],
      };
    };
    const result = await runPersistentScannerV2("https://propeller.example/", {
      stateRoot: root,
      releaseSha: "release-a",
      requestMs: 2_000,
      now: () => 0,
      discover: discover as never,
      processUrl: processUrl as never,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.warnings.includes("search_endpoint"), false);
    assert.equal(result.scannerV2?.fetched, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("zero-fetch resume reseeds and surfaces the skip reason", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-zero-fetch-"));
  let discoveryCalls = 0;
  try {
    const discover = async (rawUrl: string) => {
      discoveryCalls += 1;
      const origin = new URL(rawUrl).origin;
      const skipped = discoveryCalls === 1;
      return {
        manifest: {
          crawlId: "seed",
          origin,
          state: "PARTIAL" as const,
          discovered: 1,
          queued: skipped ? 0 : 1,
          fetched: 0,
          duplicate: 0,
          policySkipped: skipped ? 1 : 0,
          robotsSkipped: 0,
          unresolved: 0,
          urls: [
            skipped
              ? {
                  url: `${origin}/`,
                  status: "policy_skipped" as const,
                  reason: "http_403",
                  discoveryReason: "submitted" as const,
                  retryCount: 0,
                }
              : {
                  url: `${origin}/`,
                  status: "queued" as const,
                  discoveryReason: "submitted" as const,
                  retryCount: 0,
                },
          ],
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
      const p = page(url.url, "Alley gate repairs");
      return {
        disposition: "fetched" as const,
        canonicalUrl: p.canonicalUrl,
        page: p,
        chunks: [],
      };
    };

    const first = await runPersistentScannerV2("https://alleygates.example/", {
      stateRoot: root,
      releaseSha: "release-a",
      requestMs: 1_000,
      now: () => 0,
      discover: discover as never,
      processUrl: processUrl as never,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.scannerV2?.fetched, 0);
    assert.equal(first.scannerV2?.state, "BLOCKED");
    assert.equal(first.outcome, "blocked_by_site");
    assert.equal(first.scannerV2?.resumed, false);
    assert.ok(first.warnings.includes("http_403"));
    assert.equal(first.warnings.includes("scanner_v2_partial"), false);
    assert.equal(discoveryCalls, 1);

    const second = await runPersistentScannerV2("https://alleygates.example/", {
      stateRoot: root,
      releaseSha: "release-a",
      requestMs: 1_000,
      now: () => 0,
      discover: discover as never,
      processUrl: processUrl as never,
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(discoveryCalls, 2);
    assert.equal(second.scannerV2?.resumed, true);
    assert.equal(second.scannerV2?.fetched, 1);
    assert.equal(second.scannerV2?.state, "COMPLETE");
    assert.equal(second.draft.businessName, "Acme Gates");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("worker retries a bot-rejected homepage through the browser fetch", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-bot-ua-"));
  const browserUrls: string[] = [];
  try {
    const result = await runPersistentScannerV2("https://alleygates.example/", {
      stateRoot: root,
      releaseSha: "bot-ua",
      requestMs: 8_000,
      batchSize: 4,
      discoveryOptions: {
        lookup: async () => ["203.0.113.10"],
        get: async (url) => {
          if (url.pathname === "/robots.txt") {
            return {
              status: 200,
              headers: { "content-type": "text/plain" },
              body: "User-agent: *\nAllow: /\n",
              url,
            };
          }
          if (url.pathname.endsWith(".xml")) {
            return {
              status: 404,
              headers: { "content-type": "text/plain" },
              body: "missing",
              url,
            };
          }
          return {
            status: 401,
            headers: { "content-type": "text/html" },
            body: "denied",
            url,
          };
        },
        browserDocumentFetch: async ({ url }) => {
          browserUrls.push(url);
          return {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
            body: "<html><body><h1>Alley Gates</h1><p>We design and install alley gates for homes in Liverpool and across the North West.</p></body></html>",
            url: new URL(url),
          };
        },
      },
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(browserUrls.includes("https://alleygates.example/"));
    assert.ok(browserUrls.length >= 2);
    assert.ok((result.scannerV2?.fetched ?? 0) >= 1);
    assert.equal(result.warnings.includes("http_401"), false);
    assert.match(JSON.stringify(result.knowledge ?? []), /alley gates/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("site block is a 401 or 403 with nothing fetched", () => {
  assert.equal(
    siteBlockedScan({ fetched: 0, warnings: ["http_403", "scanner_v2_partial"] }),
    true,
  );
  assert.equal(siteBlockedScan({ fetched: 0, warnings: ["http_401"] }), true);
  assert.equal(siteBlockedScan({ fetched: 2, warnings: ["http_403"] }), false);
  assert.equal(
    siteBlockedScan({ fetched: 0, warnings: ["scanner_v2_partial"] }),
    false,
  );
  assert.equal(siteBlockedScan({ fetched: 0, warnings: ["fetch_failed"] }), false);
});

test("an empty 403 from the host is blocked_by_site and still a completed scan", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-site-block-"));
  try {
    const result = await runPersistentScannerV2("https://alleygates.example/", {
      stateRoot: root,
      releaseSha: "site-block",
      requestMs: 8_000,
      batchSize: 4,
      discoveryOptions: {
        lookup: async () => ["203.0.113.45"],
        get: async (url) => ({
          status: 403,
          headers: { "content-type": "text/html" },
          body: "",
          url,
        }),
        browserDocumentFetch: async ({ url }) => ({
          status: 403,
          headers: { "content-type": "text/html" },
          body: "",
          url: new URL(url),
        }),
      },
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.outcome, "blocked_by_site");
    assert.equal(result.scannerV2?.state, "BLOCKED");
    assert.equal(result.warnings.includes("scanner_v2_partial"), false);
    assert.equal(result.scannerV2?.fetched, 0);
    assert.equal(result.draft.businessName, "Unknown — not found");
    assert.ok(result.warnings.includes("http_403"));
    assert.ok(result.warnings.includes("blocked_by_site"));
    assert.equal("error" in result, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("an 18s budget persists a partial crawl instead of running on", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-budget-"));
  const seen: string[] = [];
  try {
    let clock = 1_000;
    const discover = async (rawUrl: string) => {
      const origin = new URL(rawUrl).origin;
      const urls: CrawlUrlDisposition[] = ["/", "/contact", "/services", "/about", "/team"].map((path) => ({
        url: origin + path,
        status: "queued" as const,
        discoveryReason: "sitemap" as const,
      }));
      return {
        manifest: {
          crawlId: "seed",
          origin,
          state: "PARTIAL" as const,
          discovered: urls.length,
          queued: urls.length,
          fetched: 0,
          duplicate: 0,
          policySkipped: 0,
          robotsSkipped: 0,
          unresolved: 0,
          urls,
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
    const first = await runPersistentScannerV2("https://croft.example/", {
      stateRoot: root,
      releaseSha: "budget",
      requestMs: 18_000,
      batchSize: 8,
      now: () => clock,
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        seen.push(url.url);
        clock += 20_000;
        return {
          disposition: "fetched" as const,
          canonicalUrl: url.url,
          page: page(url.url, `Page ${url.url} with a phone 0151 496 0000`),
          chunks: [],
        };
      }) as never,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(seen.length, 1);
    assert.equal(first.scannerV2?.state, "CRAWLING");
    assert.equal(first.scannerV2?.fetched, 1);
    assert.ok(first.warnings.includes("time_budget"));
    assert.equal(first.draft.businessName, "Acme Gates");
    const crawlId = first.scannerV2?.crawlId;
    assert.equal(typeof crawlId, "string");

    clock = 1_000;
    const second = await runPersistentScannerV2("https://croft.example/contact", {
      stateRoot: root,
      releaseSha: "budget",
      requestMs: 18_000,
      batchSize: 8,
      now: () => clock,
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        seen.push(url.url);
        return {
          disposition: "fetched" as const,
          canonicalUrl: url.url,
          page: page(url.url, `Resumed ${url.url}`),
          chunks: [],
        };
      }) as never,
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.scannerV2?.crawlId, crawlId);
    assert.equal(second.scannerV2?.resumed, true);
    assert.ok((second.scannerV2?.fetched ?? 0) > 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a slow final draft build still returns inside the request budget", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-draft-budget-"));
  class SlowPages extends FileScannerV2JobStore {
    async listPages(crawlId: string): Promise<CrawlPage[]> {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 5_000);
        timer.unref();
      });
      return super.listPages(crawlId);
    }
  }
  try {
    const discover = async (rawUrl: string) => {
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
    const started = Date.now();
    const result = await runPersistentScannerV2("https://wirralheating.com/", {
      stateRoot: root,
      store: new SlowPages(root),
      releaseSha: "draft-budget",
      requestMs: 1_000,
      batchSize: 4,
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        const fetched = page(url.url, `Wirral Heating ${url.url} 0151 496 0100`);
        return {
          disposition: "fetched" as const,
          canonicalUrl: fetched.canonicalUrl,
          page: fetched,
          chunks: [],
        };
      }) as never,
    });
    const elapsed = Date.now() - started;
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(elapsed < 1_800, `elapsed ${elapsed}`);
    assert.ok(elapsed >= 700, `elapsed ${elapsed}`);
    assert.equal(result.scannerV2?.state, "CRAWLING");
    assert.ok(result.warnings.includes("time_budget"));
    assert.equal(typeof result.scannerV2?.fetched, "number");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("document parse failures are skipped instead of retried", () => {
  assert.equal(
    documentCrawlDisposition({ ok: false, incomplete: true, reason: "document_parse_failed" }).disposition,
    "policy_skipped",
  );
  assert.equal(
    documentCrawlDisposition({ ok: false, incomplete: true, reason: "document_parse_timeout" }).disposition,
    "policy_skipped",
  );
  assert.equal(
    documentCrawlDisposition({ ok: false, incomplete: true, reason: "document_http_503" }).disposition,
    "unresolved",
  );
  assert.equal(
    documentCrawlDisposition({ ok: false, incomplete: false, reason: "cross_origin_redirect" }).disposition,
    "policy_skipped",
  );
  assert.equal(
    documentCrawlDisposition({ ok: false, incomplete: true, reason: "response_too_large" }).disposition,
    "policy_skipped",
  );
});

test("a hung page returns the persisted partial within the request budget", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "scanner-v2-hard-budget-"));
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  try {
    const discover = async (rawUrl: string) => {
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
    const started = Date.now();
    const first = await runPersistentScannerV2("https://phr.example/", {
      stateRoot: root,
      releaseSha: "hard-budget",
      batchSize: 1,
      requestMs: 1_000,
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        calls += 1;
        if (calls > 1) await gate;
        const p = page(url.url, `PHR Solicitors Wirral ${url.url}`);
        return {
          disposition: "fetched" as const,
          canonicalUrl: p.canonicalUrl,
          page: p,
          chunks: [],
        };
      }) as never,
    });
    const elapsed = Date.now() - started;
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.ok(elapsed < 1_800, `elapsed ${elapsed}`);
    assert.ok(elapsed >= 400, `elapsed ${elapsed}`);
    assert.ok(calls >= 2);
    assert.equal(first.scannerV2?.state, "CRAWLING");
    assert.equal(first.scannerV2?.fetched, 1);
    assert.ok(first.warnings.includes("time_budget"));
    assert.equal(first.draft.businessName, "Acme Gates");
    const crawlId = first.scannerV2?.crawlId;

    release();
    await new Promise((resolve) => setTimeout(resolve, 200));

    const second = await runPersistentScannerV2("https://phr.example/contact", {
      stateRoot: root,
      releaseSha: "hard-budget",
      batchSize: 8,
      requestMs: 1_000,
      discover: discover as never,
      processUrl: (async ({ url }: { url: CrawlUrlDisposition }) => {
        const p = page(url.url, "Resumed page");
        return {
          disposition: "fetched" as const,
          canonicalUrl: p.canonicalUrl,
          page: p,
          chunks: [],
        };
      }) as never,
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.scannerV2?.resumed, true);
    assert.equal(second.scannerV2?.crawlId, crawlId);
    assert.ok((second.scannerV2?.fetched ?? 0) > 1);
  } finally {
    release();
    await rm(root, { recursive: true, force: true });
  }
});

test("aggregateFacts omits low-confidence businessName", () => {
  const facts: BusinessFacts = {
    businessName: "Acme Corp",
    address: "123 Main St",
    hours: "Mo-Fr 09:00-17:00",
    services: ["Service A", "Service B"],
    faqs: [{ question: "Q1?", answer: "A1" }],
  };
  const factMeta: BusinessFactMeta = {
    businessName: { confidence: "low", source: "test" },
    address: { confidence: "high", source: "test" },
    hours: { confidence: "high", source: "test" },
    services: [{ confidence: "high", source: "test" }, { confidence: "high", source: "test" }],
    faqs: [{ confidence: "high", source: "test" }],
  };
  const { facts: outFacts, factMeta: outMeta } = aggregateFacts(facts, factMeta);
  assert.equal(outFacts.businessName, undefined);
  assert.equal(outMeta.businessName, undefined);
  assert.equal(outFacts.address, "123 Main St");
  assert.equal(outFacts.hours, "Mo-Fr 09:00-17:00");
  assert.deepEqual(outFacts.services, ["Service A", "Service B"]);
});

test("aggregateFacts omits low-confidence address", () => {
  const facts: BusinessFacts = {
    businessName: "Acme Corp",
    address: "123 Main St",
    hours: "Mo-Fr 09:00-17:00",
  };
  const factMeta: BusinessFactMeta = {
    businessName: { confidence: "high", source: "test" },
    address: { confidence: "low", source: "test" },
    hours: { confidence: "high", source: "test" },
  };
  const { facts: outFacts, factMeta: outMeta } = aggregateFacts(facts, factMeta);
  assert.equal(outFacts.businessName, "Acme Corp");
  assert.equal(outFacts.address, undefined);
  assert.equal(outMeta.address, undefined);
  assert.equal(outFacts.hours, "Mo-Fr 09:00-17:00");
});

test("aggregateFacts omits low-confidence hours", () => {
  const facts: BusinessFacts = {
    businessName: "Acme Corp",
    address: "123 Main St",
    hours: "Mo-Fr 09:00-17:00",
  };
  const factMeta: BusinessFactMeta = {
    businessName: { confidence: "high", source: "test" },
    address: { confidence: "high", source: "test" },
    hours: { confidence: "low", source: "test" },
  };
  const { facts: outFacts, factMeta: outMeta } = aggregateFacts(facts, factMeta);
  assert.equal(outFacts.businessName, "Acme Corp");
  assert.equal(outFacts.address, "123 Main St");
  assert.equal(outFacts.hours, undefined);
  assert.equal(outMeta.hours, undefined);
});

test("aggregateFacts filters low-confidence services", () => {
  const facts: BusinessFacts = {
    businessName: "Acme Corp",
    services: ["Good Service", "Bad Service", "Another Good"],
  };
  const factMeta: BusinessFactMeta = {
    businessName: { confidence: "high", source: "test" },
    services: [
      { confidence: "high", source: "test" },
      { confidence: "low", source: "test" },
      { confidence: "high", source: "test" },
    ],
  };
  const { facts: outFacts, factMeta: outMeta } = aggregateFacts(facts, factMeta);
  assert.deepEqual(outFacts.services, ["Good Service", "Another Good"]);
  assert.deepEqual(outMeta.services, [
    { confidence: "high", source: "test" },
    { confidence: "high", source: "test" },
  ]);
});

test("aggregateFacts filters low-confidence faqs", () => {
  const facts: BusinessFacts = {
    businessName: "Acme Corp",
    faqs: [
      { question: "Good Q?", answer: "Good A" },
      { question: "Bad Q?", answer: "Bad A" },
    ],
  };
  const factMeta: BusinessFactMeta = {
    businessName: { confidence: "high", source: "test" },
    faqs: [
      { confidence: "high", source: "test", question: "Good Q?", sourceUrl: "https://example.com" },
      { confidence: "low", source: "test", question: "Bad Q?", sourceUrl: "https://example.com" },
    ],
  };
  const { facts: outFacts, factMeta: outMeta } = aggregateFacts(facts, factMeta);
  assert.equal(outFacts.faqs?.length, 1);
  assert.equal(outFacts.faqs?.[0].question, "Good Q?");
  assert.equal(outMeta.faqs?.length, 1);
  assert.equal(outMeta.faqs?.[0].confidence, "high");
});

test("draftFromFacts shows Unknown for missing businessName", () => {
  const facts: BusinessFacts = {
    address: "123 Main St",
    hours: "Mo-Fr 09:00-17:00",
    services: ["Service A"],
    faqs: [{ question: "Q?", answer: "A" }],
  };
  const draft = draftFromFacts(facts);
  assert.equal(draft.businessName, "Unknown — not found");
  assert.equal(draft.address, "123 Main St");
  assert.equal(draft.hours, "Mo-Fr 09:00-17:00");
  assert.equal(draft.services, "Service A");
  assert.equal(draft.faqs, "Q: Q?\nA: A");
});

test("draftFromFacts shows Unknown for all missing fields", () => {
  const facts: BusinessFacts = {};
  const draft = draftFromFacts(facts);
  assert.equal(draft.businessName, "Unknown — not found");
  assert.equal(draft.address, "Unknown — not found");
  assert.equal(draft.hours, "Unknown — not found");
  assert.equal(draft.services, "Unknown — not found");
  assert.equal(draft.faqs, "Unknown — not found");
});

test("draftFromFacts handles empty services array", () => {
  const facts: BusinessFacts = {
    services: [],
  };
  const draft = draftFromFacts(facts);
  assert.equal(draft.services, "Unknown — not found");
});

test("draftFromFacts handles empty faqs array", () => {
  const facts: BusinessFacts = {
    faqs: [],
  };
  const draft = draftFromFacts(facts);
  assert.equal(draft.faqs, "Unknown — not found");
});
