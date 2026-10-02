import type {
  CrawlJob,
  CrawlManifest,
  CrawlState,
  CrawlUrlDisposition,
} from "./types.ts";

export const SCANNER_V2_STATUS_SOURCE_PREVIEW_LIMIT = 50;

export type ScannerV2Completeness =
  | "in_progress"
  | "complete"
  | "partial"
  | "failed";

export type ScannerV2OperationalStatus = {
  state: CrawlState;
  label: string;
  completeness: ScannerV2Completeness;
  discovered: number;
  fetched: number;
  queued: number;
  unresolved: number;
  skipped: number;
  lastScanAt?: string;
  fullyLearned: boolean;
  progressText: string;
  sourceCount: number;
  sourcePreview: Array<
    Pick<
      CrawlUrlDisposition,
      "url" | "canonicalUrl" | "status" | "reason" | "discoveredFrom"
    >
  >;
};

function safeIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}

function deriveLastScanAt(
  manifest: CrawlManifest,
  job?: CrawlJob,
): string | undefined {
  const jobUpdated = safeIso(job?.updatedAt);
  if (jobUpdated) return jobUpdated;

  let latest = -Infinity;
  for (const row of manifest.urls) {
    const value = safeIso(row.fetchedAt ?? row.lastAttemptAt);
    if (!value) continue;
    const time = Date.parse(value);
    if (time > latest) latest = time;
  }
  return Number.isFinite(latest)
    ? new Date(latest).toISOString()
    : undefined;
}

function deriveCounts(manifest: CrawlManifest) {
  const rows = manifest.urls;
  return {
    discovered: rows.length,
    fetched: rows.filter((row) => row.status === "fetched").length,
    queued: rows.filter((row) => row.status === "queued").length,
    unresolved: rows.filter((row) => row.status === "unresolved").length,
    skipped: rows.filter(
      (row) =>
        row.status === "policy_skipped" ||
        row.status === "robots_skipped",
    ).length,
  };
}

function failClosedState(
  requested: CrawlState,
  counts: ReturnType<typeof deriveCounts>,
): CrawlState {
  if (
    requested === "COMPLETE" &&
    (counts.queued > 0 || counts.unresolved > 0)
  ) {
    return "PARTIAL";
  }
  return requested;
}

function labelFor(
  state: CrawlState,
  counts: ReturnType<typeof deriveCounts>,
): string {
  switch (state) {
    case "DISCOVERING":
      return "Discovering website";
    case "CRAWLING":
      return `Crawling ${counts.fetched}/${counts.discovered} pages`;
    case "INDEXING":
      return `Indexing ${counts.fetched} fetched pages`;
    case "COMPLETE":
      return "Website knowledge complete";
    case "PARTIAL":
      return "Website knowledge partial";
    case "FAILED":
      return "Website knowledge failed";
  }
}

function completenessFor(state: CrawlState): ScannerV2Completeness {
  if (state === "COMPLETE") return "complete";
  if (state === "PARTIAL") return "partial";
  if (state === "FAILED") return "failed";
  return "in_progress";
}

export function projectScannerV2OperationalStatus(input: {
  manifest: CrawlManifest;
  job?: CrawlJob;
}): ScannerV2OperationalStatus {
  const counts = deriveCounts(input.manifest);
  const requestedState = input.job?.state ?? input.manifest.state;
  const state = failClosedState(requestedState, counts);
  const fullyLearned =
    state === "COMPLETE" &&
    counts.queued === 0 &&
    counts.unresolved === 0;

  const progressText =
    state === "COMPLETE"
      ? `${counts.fetched} pages fetched; no unresolved pages.`
      : state === "PARTIAL"
        ? `${counts.fetched} of ${counts.discovered} pages fetched; ${counts.unresolved} unresolved; ${counts.queued} still queued.`
        : state === "FAILED"
          ? `Crawl failed with ${counts.unresolved} unresolved pages.`
          : `${counts.fetched} of ${counts.discovered} pages fetched; ${counts.queued} queued.`;

  const sourcePreview = [...input.manifest.urls]
    .sort((a, b) => a.url.localeCompare(b.url))
    .slice(0, SCANNER_V2_STATUS_SOURCE_PREVIEW_LIMIT)
    .map((row) => ({
      url: row.url,
      ...(row.canonicalUrl ? { canonicalUrl: row.canonicalUrl } : {}),
      status: row.status,
      ...(row.reason ? { reason: row.reason } : {}),
      ...(row.discoveredFrom ? { discoveredFrom: row.discoveredFrom } : {}),
    }));

  return {
    state,
    label: labelFor(state, counts),
    completeness: completenessFor(state),
    ...counts,
    lastScanAt: deriveLastScanAt(input.manifest, input.job),
    fullyLearned,
    progressText,
    sourceCount: input.manifest.urls.length,
    sourcePreview,
  };
}
