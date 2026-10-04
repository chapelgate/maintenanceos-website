import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { stableContentHash, stableChunkId } from "./scanner-v2-foundation.ts";
import { runScannerV2Runtime } from "./scanner-v2-runtime.ts";
import type {
  CrawlManifest,
  ScanResult,
} from "./types.ts";

function manifest(incomplete = false): CrawlManifest {
  return {
    crawlId: "scanner-v2-discovery",
    origin: "https://acme.example",
    state: incomplete ? "PARTIAL" : "DISCOVERING",
    discovered: 1,
    queued: 0,
    fetched: 1,
    duplicate: 0,
    policySkipped: 0,
    robotsSkipped: 0,
    unresolved: 0,
    urls: [
      {
        url: "https://acme.example/deep",
        canonicalUrl: "https://acme.example/deep",
        status: "fetched",
        discoveryReason: "html_link",
        discoveredFrom: "https://acme.example/",
        contentHash: stableContentHash("discovery"),
        fetchedAt: "2026-10-04T15:00:00.000Z",
      },
    ],
  };
}

function v1(): ScanResult {
  return {
    ok: true,
    untrusted: true,
    draft: { businessName: "Acme" },
    warnings: [],
    sources: [],
    facts: { website: "https://acme.example/" },
  };
}

test("production runtime persists and resumes without re-discovery", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "mos-v2-runtime-"));
  let discoveries = 0;
  let processed = 0;
  try {
    const options = {
      enabled: true,
      v2Enabled: true,
      stateDir: dir,
      releaseSha: "sha-1",
      discovery: async () => {
        discoveries += 1;
        return {
          manifest: manifest(false),
          sitemapSources: [],
          pageSources: [],
          sitemapDocuments: 0,
          sitemapUrlsDiscovered: 0,
          htmlPagesFetched: 1,
          htmlLinksDiscovered: 1,
          urlsDroppedByLimit: 0,
          warnings: [],
          limitReached: false,
          incomplete: false,
        };
      },
      processUrl: async ({ url }: { url: { url: string } }) => {
        processed += 1;
        const text =
          "Heritage alley gate installation normally takes six weeks after survey.";
        const contentHash = stableContentHash(text);
        return {
          disposition: "fetched" as const,
          canonicalUrl: url.url,
          page: {
            requestedUrl: url.url,
            canonicalUrl: url.url,
            title: "Deep installation",
            headings: ["Lead time"],
            visibleText: text,
            structuredFacts: {},
            contentType: "text/html",
            fetchMode: "http" as const,
            contentHash,
            fetchedAt: "2026-10-04T15:01:00.000Z",
          },
          chunks: [
            {
              id: stableChunkId(url.url, 0, text),
              canonicalUrl: url.url,
              title: "Deep installation",
              headingPath: ["Lead time"],
              text,
              ordinal: 0,
              contentHash,
            },
          ],
        };
      },
      v1Scan: async () => v1(),
    };

    const first = await runScannerV2Runtime(
      "https://acme.example/",
      options,
    );
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.scannerV2?.completeness, "complete");
    assert.equal(first.scannerV2?.fullyLearned, true);
    assert.match(first.knowledge?.[0]?.text ?? "", /six weeks/i);
    assert.equal(discoveries, 1);
    assert.equal(processed, 1);

    const second = await runScannerV2Runtime(
      "https://acme.example/",
      options,
    );
    assert.equal(second.ok, true);
    assert.equal(discoveries, 1);
    assert.equal(processed, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("discovery incompleteness survives durable worker completion", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "mos-v2-runtime-partial-"));
  try {
    const result = await runScannerV2Runtime("https://acme.example/", {
      enabled: true,
      v2Enabled: true,
      stateDir: dir,
      releaseSha: "sha-partial",
      discovery: async () => ({
        manifest: manifest(true),
        sitemapSources: [],
        pageSources: [],
        sitemapDocuments: 0,
        sitemapUrlsDiscovered: 0,
        htmlPagesFetched: 1,
        htmlLinksDiscovered: 0,
        urlsDroppedByLimit: 0,
        warnings: ["robots_unavailable"],
        limitReached: false,
        incomplete: true,
      }),
      processUrl: async ({ url }) => {
        const text = "Public fact";
        const contentHash = stableContentHash(text);
        return {
          disposition: "fetched",
          canonicalUrl: url.url,
          page: {
            requestedUrl: url.url,
            canonicalUrl: url.url,
            headings: [],
            visibleText: text,
            structuredFacts: {},
            contentType: "text/html",
            fetchMode: "http",
            contentHash,
            fetchedAt: "2026-10-04T15:02:00.000Z",
          },
          chunks: [
            {
              id: stableChunkId(url.url, 0, text),
              canonicalUrl: url.url,
              headingPath: [],
              text,
              ordinal: 0,
              contentHash,
            },
          ],
        };
      },
      v1Scan: async () => v1(),
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.scannerV2?.completeness, "partial");
    assert.equal(result.scannerV2?.fullyLearned, false);
    assert.ok(result.warnings.includes("robots_unavailable"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("runtime remains feature-gated", async () => {
  const result = await runScannerV2Runtime("https://acme.example/", {
    enabled: true,
    v2Enabled: false,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "scan_disabled");
});
