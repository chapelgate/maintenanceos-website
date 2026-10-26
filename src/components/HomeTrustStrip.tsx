/**
 * Authoritative Governance & Trust Strip
 * Replaces separate disclaimer sections with one compact trust bar.
 */
export function HomeTrustStrip() {
  return (
    <div className="home-trust-strip border-y border-border bg-paper py-3 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="font-semibold text-ink">Architecture rules:</span>
          <span>Rules own safety &amp; money.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-medium">
          <span className="home-trust-chip">Pre-launch</span>
          <span className="home-trust-chip">UK maintenance ops</span>
          <span className="home-trust-chip">Claims evidence pinned to audited checkpoint</span>
          <span className="home-trust-chip">No client-money execution</span>
          <span className="home-trust-chip">Authorised human clearance</span>
          <span className="home-trust-chip">No live phone on this site</span>
        </div>
      </div>
    </div>
  );
}
