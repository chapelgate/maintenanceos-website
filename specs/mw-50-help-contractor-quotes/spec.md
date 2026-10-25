# mw-50-help-contractor-quotes

## Problem
`src/content/help/contractor-quotes.mdx` still publishes a live quote workflow with triggers, approval steps, and budget controls.

## Acceptance
- The article says quote requests are not published, and that this is not a live quote workflow.
- It does not name triggers, Reports → paths, or budget limits.
- Frontmatter description ≤ 160 chars.
- `node --test scripts/help-contractor-quotes.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
