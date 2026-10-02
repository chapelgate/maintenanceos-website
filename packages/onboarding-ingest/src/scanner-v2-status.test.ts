import assert from "node:assert/strict";
import test from "node:test";
import {
  projectScannerV2OperationalStatus,
  SCANNER_V2_STATUS_SOURCE_PREVIEW_LIMIT,
} from "./scanner-v2-status.ts";
import type { CrawlJob, CrawlManifest } from "./types.ts";

function manifest(
  state: CrawlManifest["state"],
  statuses: CrawlManifest["urls"][number]["status"][],
): CrawlManifest {
  return {
    crawlId: "crawl-1",
    origin: "https://example.com",
    state,
    discovered: statuses.length,
    queued: statuses.filter((s) => s === "queued").length,
    fetched: statuses.filter((s) => s === "fetched").length,
    duplicate: statuses.filter((s) => s === "duplicate").length,
    policySkipped: statuses.filter((s) => s === "policy_skipped").length,
    robotsSkipped: statuses.filter((s) => s === "robots_skipped").length,
    unresolved: statuses.filter((s) => s === "unresolved").length,
    urls: statuses.map((status, i) => ({
      url: `https://example.com/page-${i}`,
      status,
      discoveryReason: i === 0 ? "submitted" : "html_link",
      ...(status === "fetched"
        ? { fetchedAt: `2026-10-02T12:${String(i).padStart(2, "0")}:00.000Z` }
        : {}),
    })),
  };
}

test("status projection renders all six operational states", () => {
  const cases: Array<{
    state: CrawlManifest["state"];
    statuses: CrawlManifest["urls"][number]["status"][];
    label: string;
  }> = [
    {
      state: "DISCOVERING",
      statuses: ["queued"],
      label: "Discovering website",
    },
    {
      state: "CRAWLING",
      statuses: ["fetched", "queued"],
      label: "Crawling 1/2 pages",
    },
    {
      state: "INDEXING",
      statuses: ["fetched"],
      label: "Indexing 1 fetched pages",
    },
    {
      state: "COMPLETE",
      statuses: ["fetched"],
      label: "Website knowledge complete",
    },
    {
      state: "PARTIAL",
      statuses: ["fetched", "unresolved"],
      label: "Website knowledge partial",
    },
    {
      state: "FAILED",
      statuses: ["unresolved"],
      label: "Website knowledge failed",
    },
  ];

  for (const item of cases) {
    const value = projectScannerV2OperationalStatus({
      manifest: manifest(item.state, item.statuses),
    });
    assert.equal(value.state, item.state);
    assert.equal(value.label, item.label);
  }
});

test("COMPLETE fails closed to PARTIAL when queued or unresolved pages remain", () => {
  const value = projectScannerV2OperationalStatus({
    manifest: manifest("COMPLETE", ["fetched", "queued", "unresolved"]),
  });
  assert.equal(value.state, "PARTIAL");
  assert.equal(value.completeness, "partial");
  assert.equal(value.fullyLearned, false);
  assert.match(value.progressText, /1 unresolved/);
  assert.match(value.progressText, /1 still queued/);
});

test("fullyLearned is true only for a clean COMPLETE corpus", () => {
  const complete = projectScannerV2OperationalStatus({
    manifest: manifest("COMPLETE", ["fetched", "fetched", "policy_skipped"]),
  });
  assert.equal(complete.state, "COMPLETE");
  assert.equal(complete.fullyLearned, true);
  assert.equal(complete.unresolved, 0);
  assert.equal(complete.queued, 0);

  const partial = projectScannerV2OperationalStatus({
    manifest: manifest("PARTIAL", ["fetched", "unresolved"]),
  });
  assert.equal(partial.fullyLearned, false);
});

test("projection derives counts from URL rows rather than trusting stale manifest counters", () => {
  const stale = manifest("CRAWLING", ["fetched", "queued", "policy_skipped"]);
  stale.discovered = 999;
  stale.fetched = 999;
  stale.queued = 0;
  stale.unresolved = 50;

  const value = projectScannerV2OperationalStatus({ manifest: stale });
  assert.equal(value.discovered, 3);
  assert.equal(value.fetched, 1);
  assert.equal(value.queued, 1);
  assert.equal(value.unresolved, 0);
  assert.equal(value.skipped, 1);
});

test("job state and updatedAt drive operational state and last scan", () => {
  const m = manifest("CRAWLING", ["fetched"]);
  const job: CrawlJob = {
    crawlId: "crawl-1",
    origin: "https://example.com",
    state: "INDEXING",
    releaseSha: "abc",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T13:45:00.000Z",
    retryLimit: 3,
  };

  const value = projectScannerV2OperationalStatus({ manifest: m, job });
  assert.equal(value.state, "INDEXING");
  assert.equal(value.lastScanAt, "2026-10-02T13:45:00.000Z");
});

test("source preview is bounded and sorted while retaining total count", () => {
  const statuses = Array.from({ length: SCANNER_V2_STATUS_SOURCE_PREVIEW_LIMIT + 20 }, () => "fetched" as const);
  const m = manifest("COMPLETE", statuses);
  m.urls.reverse();

  const value = projectScannerV2OperationalStatus({ manifest: m });
  assert.equal(value.sourceCount, statuses.length);
  assert.equal(value.sourcePreview.length, SCANNER_V2_STATUS_SOURCE_PREVIEW_LIMIT);
  assert.equal(value.sourcePreview[0]?.url, "https://example.com/page-0");
});

test("invalid job updatedAt falls back to latest URL activity timestamp", () => {
  const m = manifest("CRAWLING", ["fetched", "fetched"]);
  const job: CrawlJob = {
    crawlId: "crawl-1",
    origin: "https://example.com",
    state: "CRAWLING",
    releaseSha: "abc",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "not-a-date",
    retryLimit: 3,
  };

  const value = projectScannerV2OperationalStatus({ manifest: m, job });
  assert.equal(value.lastScanAt, "2026-10-02T12:01:00.000Z");
});
