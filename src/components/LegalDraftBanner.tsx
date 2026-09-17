export function LegalDraftBanner() {
  return (
    <div
      role="status"
      className="mb-8 rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]"
    >
      <strong>DRAFT FOR LEGAL REVIEW.</strong> This page is a scaffold only and
      is not final legal advice or binding policy.
    </div>
  );
}
