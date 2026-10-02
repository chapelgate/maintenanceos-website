import type { ScannerV2OperationalStatus } from "../../packages/onboarding-ingest/src/scanner-v2-status.ts";

function formatLastScan(value: string | undefined): string {
  if (!value) return "Not available yet";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/London",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ScannerV2CrawlStatus({
  status,
}: {
  status: ScannerV2OperationalStatus;
}) {
  const complete = status.completeness === "complete";
  const partial = status.completeness === "partial";
  const failed = status.completeness === "failed";

  return (
    <section
      className="rounded-md border border-border bg-paper p-4 text-sm"
      aria-labelledby="scanner-v2-status-heading"
      data-scanner-v2-status=""
      data-scanner-v2-state={status.state}
      data-scanner-v2-completeness={status.completeness}
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        <h3 id="scanner-v2-status-heading" className="font-semibold text-ink">
          {status.label}
        </h3>
        <p className="mt-1 text-muted">{status.progressText}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Discovered</dt>
          <dd className="font-medium text-ink">{status.discovered}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Fetched</dt>
          <dd className="font-medium text-ink">{status.fetched}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Unresolved</dt>
          <dd className="font-medium text-ink">{status.unresolved}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Last scan</dt>
          <dd className="font-medium text-ink">
            {status.lastScanAt ? (
              <time dateTime={status.lastScanAt}>
                {formatLastScan(status.lastScanAt)}
              </time>
            ) : (
              "Not available yet"
            )}
          </dd>
        </div>
      </dl>

      {complete ? (
        <p className="mt-4 text-sm text-ink" data-scanner-v2-fully-learned="true">
          Complete: every discovered in-scope page is accounted for and there
          are no unresolved pages.
        </p>
      ) : null}

      {partial ? (
        <p className="mt-4 text-sm text-ink" role="alert">
          Partial: some website content could not be fully processed. This
          receptionist must not be presented as having learned the whole site.
        </p>
      ) : null}

      {failed ? (
        <p className="mt-4 text-sm text-ink" role="alert">
          Failed: website knowledge is not ready for use.
        </p>
      ) : null}

      {status.sourceCount > 0 ? (
        <details className="mt-4">
          <summary className="cursor-pointer font-medium text-ink">
            View crawl sources ({status.sourceCount})
          </summary>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            {status.sourcePreview.map((source) => (
              <li key={source.url} className="break-all">
                <span className="font-medium text-ink">{source.status}</span>
                {" — "}
                {source.url}
                {source.reason ? ` — ${source.reason}` : ""}
              </li>
            ))}
          </ul>
          {status.sourceCount > status.sourcePreview.length ? (
            <p className="mt-2 text-xs text-muted">
              Showing the first {status.sourcePreview.length} sources.
            </p>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}
