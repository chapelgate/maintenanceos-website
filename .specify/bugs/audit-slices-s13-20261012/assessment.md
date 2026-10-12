# Assessment: leftover audit slices on the public site

- Home showed three different steps from `/create` and `/demo`. The shared strip added "→ optional save", and `/demo` added a sixth "Save setup" step. "Review & Pack" was still in the pricing scope line and the unused funnel label.
- `/dashboard` printed `NEXT_PUBLIC_` and `packages/` and did not link to the sample catalogue on `/demo`.
- `/status` and `/dashboard` were in the sitemap and indexable.
- The product-tour video had no `:focus-visible` outline. The home "45s product tour" link already pointed at `/how-it-works/#product-tour`.
- JSON-LD named the organisation "Chapelgate". Sample transcript and prompt copy still said ReceptionistOS.
- Several meta descriptions were longer than 160 characters, and the home, contact, and FAQ titles did not end with "| MaintenanceOS".
- Lead capture had one form-level error, did not focus the email field, and still posted when the hidden website field was filled. The enquiry fallback already replaced the form when no endpoint is configured.
- Static export already sets `trailingSlash: true`. `redirects()` are not applied with `output: "export"`, so a trailing-slash 301 would need a platform change.

Verdict: verified against the current pages before the fix.
