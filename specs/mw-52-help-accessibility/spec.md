# mw-52-help-accessibility

## Problem
`src/content/help/accessibility-features.mdx` still publishes live portal accessibility features, keyboard shortcuts, and unverified testing claims.

## Acceptance
- The article says portal accessibility features are not published, and that this is not a verified WCAG claim.
- It does not name Alt+ shortcuts, voice input, full Welsh portal translation, or PR axe/Lighthouse thresholds.
- Frontmatter description ≤ 160 chars.
- `node --test scripts/help-accessibility-features.test.mjs scripts/help-phantom-channels.test.mjs scripts/help-phantom-hosts.test.mjs scripts/help-price-honesty.test.mjs scripts/help-sla-honesty.test.mjs scripts/wcag-claim-lock.test.mjs scripts/public-copy.test.mjs scripts/brand-consistency.test.mjs` exits 0.
