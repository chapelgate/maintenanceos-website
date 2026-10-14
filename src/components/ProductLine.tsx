/**
 * WorkSmartOS product line. MaintenanceOS is the product on this site.
 * ReceptionistOS is named only as coming soon — no route and no live claim.
 */
export function ProductLine() {
  return (
    <section
      aria-labelledby="product-line-heading"
      className="border-b border-border bg-paper px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="product-line-heading"
          className="text-sm font-semibold uppercase tracking-wide text-accent"
        >
          Products
        </h2>
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2">
          <li className="mos-bento-card">
            <h3 className="text-base font-semibold text-ink">
              WorkSmartOS MaintenanceOS
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Property maintenance intake on this site. Pre-launch, not live.
            </p>
          </li>
          <li className="mos-bento-card">
            <h3 className="text-base font-semibold text-ink">ReceptionistOS</h3>
            <p className="mt-2">
              <span className="badge con">Coming soon</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Not live. No public page yet.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
