/**
 * Draft note for a future consent UI. No storage or third-party tags.
 * Anchored from footer Cookie settings → /cookies/#settings
 * (host section provides the h2; this is supporting copy only).
 */
export function CookieSettingsStub() {
  return (
    <div className="mt-4 rounded-md border border-border bg-paper px-4 py-3 text-sm text-muted">
      <p className="font-medium text-accent">
        Consent UI TBD — draft expectations only. No non-essential tags are
        loaded on this site today.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">Accept all</strong> — when a consent UI
          exists, would allow optional categories (Preferences, Analytics,
          Marketing) subject to what is actually implemented.{" "}
          <span className="text-accent">LEGAL MUST CONFIRM</span> final wording
          and behaviour.
        </li>
        <li>
          <strong className="text-ink">Reject non-essential</strong> — default
          UK/EEA posture: Essential only; Analytics and Marketing remain off.
        </li>
        <li>
          <strong className="text-ink">Essential consent-preference storage</strong>{" "}
          — planned so a choice can be remembered; not implemented yet. Do not
          invent cookie names here.
        </li>
      </ul>
    </div>
  );
}
