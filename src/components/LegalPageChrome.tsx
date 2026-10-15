type LegalPageChromeProps = {
  /** Short label for this notice, e.g. "privacy notice" */
  noticeLabel: string;
};

/**
 * Shared chrome for legal scaffolds: last-updated, scope, contact, related links.
 * Per LEGAL_PAGE_SCAFFOLDS.md — placeholders only.
 */
export function LegalPageChrome({ noticeLabel }: LegalPageChromeProps) {
  return (
    <div className="mb-10 space-y-4 border-b border-border pb-8 text-sm text-muted">
      <p>
        <span className="font-medium text-ink">Last updated:</span>{" "}
        [OWNER: effective / last-updated date]
      </p>
      <p>
        <span className="font-medium text-ink">Who this applies to:</span>{" "}
        Visitors to the WorkSmartOS website and, where relevant,
        people who submit launch-list, demo, contact, or /create early-access
        forms.
      </p>
      <p>
        <span className="font-medium text-ink">Contact for this {noticeLabel}:</span>{" "}
        <a href="mailto:info@chapelgatetechnologies.com" className="text-accent underline">
          info@chapelgatetechnologies.com
        </a>
        . Online enquiries are temporarily unavailable. The{" "}
        <a href="/contact/" className="text-accent underline">
          contact page
        </a>{" "}
        shows the same address.
      </p>
      <p>
        <span className="font-medium text-ink">Related:</span>{" "}
        <a href="/privacy/" className="text-accent underline">
          Privacy
        </a>
        {" · "}
        <a href="/cookies/" className="text-accent underline">
          Cookies
        </a>
        {" · "}
        <a href="/terms/" className="text-accent underline">
          Terms
        </a>
        {" · "}
        <a href="/security/" className="text-accent underline">
          Security
        </a>{" "}
        <span className="text-muted">
          (product trust narrative — not a substitute for this {noticeLabel})
        </span>
      </p>
    </div>
  );
}
